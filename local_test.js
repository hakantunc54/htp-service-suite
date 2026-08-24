const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function run() {
  await prisma.order.deleteMany();
  
  const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
  const workbook = xlsx.readFile(filePath);
  
  let allRows = [];
  const localOverrides = {};

  workbook.SheetNames.forEach(sheetName => {
    const isBde = sheetName.toUpperCase().includes('BDE');
    const ws = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
    
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawData.length, 20); i++) {
      const rowArr = (rawData[i] || []);
      const rowStr = rowArr.join(" ").toLowerCase();
      if (rowStr.includes("plz") || rowStr.includes("kunde") || rowStr.includes("termin")) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex >= 2) {
      const priceRow = (rawData[headerRowIndex - 2] || []);
      const headerRow = (rawData[headerRowIndex] || []);
      for (let c = 0; c < headerRow.length; c++) {
         if (priceRow[c] && !isNaN(parseFloat(String(priceRow[c]).replace(',', '.')))) {
            const colName = String(headerRow[c]);
            const columnMap = {
              "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
              "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
              "MAW (5Min)": "MAW (5Min)", "PCI": "PCI", "vLauiAPLe": "vLauiAPLe",
              "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
              "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
              "optional": "Optional / Material (FTTB)", "Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",
            };
            let targetName = columnMap[colName];
            if (colName === "optional" && isBde) targetName = "Optional (BDE)";
            if (targetName) {
               localOverrides[targetName] = parseFloat(String(priceRow[c]).replace(',', '.'));
            }
         }
      }
    }

    if (headerRowIndex >= 0) {
      const data = xlsx.utils.sheet_to_json(ws, { range: headerRowIndex });
      data.forEach(r => r._SourceType = isBde ? "BDE" : "FTTB");
      allRows = allRows.concat(data);
    }
  });

  console.log("Extracted Overrides:", localOverrides);

  // Now simulate the action
  let importedCount = 0;
  const serviceItems = await prisma.serviceItem.findMany();
  console.log("DB Service Items count:", serviceItems.length);
  
  if (serviceItems.length === 0) {
    console.log("NO SERVICE ITEMS! CREATING DEFAULT SEED SO IT WORKS...");
    // Let's not seed here, we want to see what is in his DB
  }

  const columnMap = {
    "FTTB": "FTTB",
    "Abbruch": "Abbruch",
    "Anfahrt >12": "Anfahrt >12",
    "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
    "MAW (5Min)": "MAW (5Min)",
    "PCI": "PCI",
    "vLauiAPLe": "vLauiAPLe",
    "Warten 5Min": "Warten 5Min",
    "Warten 10Min": "Warten 10Min",
    "fZugang DPU/APL": "fZugang DPU/APL",
    "KvHdF": "KvHdF",
    "Dispo": "Dispo",
    "optional": "Optional / Material (FTTB)",
    "Arbeitszeit": "Arbeitszeit (Std.)",
    "Material": "Material (BDE)",
  };

  for (const row of allRows) {
    const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
    if (!custName) continue;
    
    // create dummy order
    const order = await prisma.order.create({
      data: {
        customer: {
          create: { name: custName, email: "dummy@dummy.com", htpCustomerNumber: "123" }
        },
        orderType: "FTTB",
        status: "Erfolgreich abgeschlossen",
        communicationStatus: "NOCH_NICHT",
        isBilled: true,
        orderValue: 0
      }
    });

    let totalValue = 0;
    
    for (const colName of Object.keys(row)) {
      const val = String(row[colName]).replace(',', '.');
      const itemVal = parseFloat(val);
      if (isNaN(itemVal) || itemVal <= 0) continue;

      let targetName = columnMap[colName];
      if (colName === "optional" && row._SourceType === "BDE") targetName = "Optional (BDE)";

      if (targetName) {
        const si = serviceItems.find(i => i.name === targetName);
        if (si) {
          let priceToApply = 0;
          let qty = itemVal;

          const customPrice = (localOverrides && localOverrides[targetName] !== undefined) ? localOverrides[targetName] : (si.defaultPrice || 0);

          if (targetName.toLowerCase().includes("optional") || targetName.toLowerCase().includes("material")) {
             priceToApply = itemVal;
             qty = 1;
          } else {
             priceToApply = customPrice * qty;
          }

          await prisma.orderServiceItem.create({
            data: {
              orderId: order.id,
              serviceItemId: si.id,
              quantity: qty,
              priceApplied: priceToApply
            }
          });
          
          totalValue += priceToApply;
        }
      }
    }
    
    await prisma.order.update({
      where: { id: order.id },
      data: { orderValue: totalValue }
    });
    
    importedCount++;
  }

  const billedData = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: true }
  });

  console.log("Imported Orders:", importedCount);
  console.log("Total DB Revenue:", billedData._sum.orderValue);
}

run().catch(console.error).finally(() => prisma.$disconnect());
