const xlsx = require("xlsx");
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);

let totalRevenue = 0;

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

  const localOverrides = {};
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

  const columnMap = {
    "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
    "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
    "MAW (5Min)": "MAW (5Min)", "PCI": "PCI", "vLauiAPLe": "vLauiAPLe",
    "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
    "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
    "optional": "Optional / Material (FTTB)", "Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",
  };

  const data = xlsx.utils.sheet_to_json(ws, { range: headerRowIndex });
  
  for (const row of data) {
    const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
    if (!custName) continue;

    for (const colName of Object.keys(row)) {
      const val = String(row[colName]).replace(',', '.');
      const itemVal = parseFloat(val);
      if (isNaN(itemVal) || itemVal <= 0) continue;

      let targetName = columnMap[colName];
      if (colName === "optional" && isBde) targetName = "Optional (BDE)";

      if (targetName) {
        // Fallback to my hardcoded defaults just in case
        let fallbackPrice = 0;
        if (targetName === "FTTB") fallbackPrice = 38;
        if (targetName === "Abbruch") fallbackPrice = 19;
        
        const price = localOverrides[targetName] !== undefined ? localOverrides[targetName] : fallbackPrice;
        
        if (targetName.includes("Optional") || targetName.includes("Material")) {
          totalRevenue += (itemVal * 1);
        } else {
          totalRevenue += (price * itemVal);
        }
      }
    }
  }
});

console.log("Total Calculated Revenue with Overrides:", totalRevenue);
