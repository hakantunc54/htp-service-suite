const xlsx = require("xlsx");
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);

let sum38 = 0;
let sum20 = 0;
let sum19 = 0;

for (const sheetName of workbook.SheetNames) {
  const ws = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    for (let j = 0; j < row.length; j++) {
       // if we can find sums at the bottom of his file...
       if (String(row[j]).includes("Gesamt") || String(row[j]).includes("Summe")) {
          console.log(`Found Sum row: ${JSON.stringify(row)}`);
       }
    }
  }
}
