const xlsx = require("xlsx");

// Load the exact file the user mentioned
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

let totalRevenue = 0;
let skippedRows = 0;
let processedRows = 0;
let unmappedColumns = new Set();
let allHeaders = new Set();
let skippedReasons = [];

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    Object.keys(row).forEach(k => allHeaders.add(k));

    const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
    
    if (!custName) {
      skippedRows++;
      skippedReasons.push(`Row ${i+2} in ${sheetName} skipped (No Customer Name). Row data: ${JSON.stringify(row).substring(0, 50)}...`);
      continue;
    }

    processedRows++;
    
    for (const colName of Object.keys(row)) {
      const itemVal = parseFloat(String(row[colName]).replace(',', '.'));
      if (isNaN(itemVal) || itemVal <= 0) continue;

      let targetName = columnMap[colName];
      if (colName === "optional" && sheetName.toUpperCase().includes("BDE")) {
        targetName = "Optional (BDE)";
      }

      if (targetName) {
        const price = priceMap[targetName] || 0;
        if (targetName.includes("Optional") || targetName.includes("Material")) {
          totalRevenue += (itemVal * 1); // 1 is multiplier for optional/material
        } else {
          totalRevenue += (price * itemVal);
        }
      } else {
        // If it's a numeric column that we didn't map, it might be a missing service!
        if (typeof itemVal === 'number' && !colName.includes("Termin") && !colName.includes("PLZ") && !colName.includes("Nr") && !colName.includes("Port")) {
           unmappedColumns.add(colName);
        }
      }
    }
  }
}

console.log("Processed rows:", processedRows);
console.log("Skipped rows:", skippedRows);
console.log("Total Calculated Revenue:", totalRevenue);
console.log("Unmapped columns with numeric values:", Array.from(unmappedColumns));
console.log("All headers found:", Array.from(allHeaders));
console.log("First 5 skipped reasons:", skippedReasons.slice(0, 5));
