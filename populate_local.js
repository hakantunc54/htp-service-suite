const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function run() {
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  
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

  const serviceItems = await prisma.serviceItem.findMany();
  
  if (serviceItems.length === 0) {
    const items = [
      { name: 'FTTB', defaultPrice: 38 }, { name: 'Abbruch', defaultPrice: 19 },
      { name: 'Anfahrt >12', defaultPrice: 20 }, { name: 'Anfahrt <12', defaultPrice: 10 },
      { name: 'MAW (5Min)', defaultPrice: 5 }, { name: 'PCI', defaultPrice: 15 },
      { name: 'vLauiAPLe', defaultPrice: 15 }, { name: 'Warten 5Min', defaultPrice: 5 },
      { name: 'Warten 10Min', defaultPrice: 10 }, { name: 'fZugang DPU/APL', defaultPrice: 15 },
      { name: 'KvHdF', defaultPrice: 15 }, { name: 'Dispo', defaultPrice: 0 },
      { name: 'Arbeitszeit (Std.)', defaultPrice: 48 }, { name: 'Optional / Material (FTTB)', defaultPrice: 1 },
      { name: 'Material (BDE)', defaultPrice: 1 }, { name: 'Optional (BDE)', defaultPrice: 1 }
    ];
    for (const item of items) {
      await prisma.serviceItem.create({ data: { name: item.name, defaultPrice: item.defaultPrice, category: item.name.includes('BDE') ? 'BDE' : 'FTTB' } });
    }
  }

  const finalItems = await prisma.serviceItem.findMany();

  const columnMap = {
    "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
    "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
    "MAW (5Min)": "MAW (5Min)", "PCI": "PCI", "vLauiAPLe": "vLauiAPLe",
    "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
    "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
    "optional": "Optional / Material (FTTB)", "Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",
  };

  for (const row of allRows) {
    const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
    if (!custName) continue;
    
    const customer = await prisma.customer.create({
      data: { name: custName, email: "dummy@dummy.com", htpCustomerNumber: "123" }
    });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
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
        const si = finalItems.find(i => i.name === targetName);
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
  }

  const billedData = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: true }
  });

  console.log("Total DB Revenue INJECTED:", billedData._sum.orderValue);
}

run().catch(console.error).finally(() => prisma.$disconnect());
