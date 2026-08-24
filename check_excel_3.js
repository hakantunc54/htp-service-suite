const xlsx = require("xlsx");
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);

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

let skippedReasons = [];
for (let i=0; i<allRows.length; i++) {
  const row = allRows[i];
  const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
  if (!custName) {
    // Is it completely empty?
    const hasData = Object.keys(row).some(k => k !== "_SourceType" && String(row[k]).trim() !== "");
    if (hasData) {
       skippedReasons.push(row);
    }
  }
}

console.log("Skipped rows WITH DATA:", JSON.stringify(skippedReasons.slice(0, 10), null, 2));
