const xlsx = require("xlsx");
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);

const columnMap = {
  "FTTB": "FTTB",
  "Abbruch": "Abbruch",
  "Anfahrt >12": "Anfahrt >12",
  "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", 
  "Anfahrt <12": "Anfahrt <12",
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
const priceMap = {
  "FTTB": 38,
  "Abbruch": 19,
  "Anfahrt >12": 20,
  "Anfahrt <12": 10,
  "MAW (5Min)": 5,
  "PCI": 15,
  "vLauiAPLe": 15,
  "Warten 5Min": 5,
  "Warten 10Min": 10,
  "fZugang DPU/APL": 15,
  "KvHdF": 15,
  "Dispo": 0,
  "Optional / Material (FTTB)": 1,
  "Arbeitszeit (Std.)": 48,
  "Material (BDE)": 1,
  "Optional (BDE)": 1
};

let allRows = [];
for (const sheetName of workbook.SheetNames) {
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
  if (headerRowIndex >= 0) {
    const data = xlsx.utils.sheet_to_json(ws, { range: headerRowIndex });
    data.forEach(r => r._SourceType = sheetName.toUpperCase().includes('BDE') ? "BDE" : "FTTB");
    allRows = allRows.concat(data);
  }
}

let totalRevenue = 0;
let skippedRows = 0;
let processedRows = 0;

for (const row of allRows) {
  const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
  if (!custName) {
    skippedRows++;
    continue;
  }
  processedRows++;
  
  for (const colName of Object.keys(row)) {
    const val = String(row[colName]).replace(',', '.');
    const itemVal = parseFloat(val);
    if (isNaN(itemVal) || itemVal <= 0) continue;

    let targetName = columnMap[colName];
    if (colName === "optional" && row._SourceType === "BDE") targetName = "Optional (BDE)";

    if (targetName) {
      const price = priceMap[targetName] || 0;
      if (targetName.includes("Optional") || targetName.includes("Material")) {
        totalRevenue += (itemVal * 1);
      } else {
        totalRevenue += (price * itemVal);
      }
    }
  }
}

console.log("Found rows via header logic:", allRows.length);
console.log("Processed rows:", processedRows);
console.log("Skipped rows:", skippedRows);
console.log("Total Calculated Revenue:", totalRevenue);
