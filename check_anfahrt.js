const xlsx = require('xlsx');
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);
const ws = workbook.Sheets[workbook.SheetNames[0]];

const data = xlsx.utils.sheet_to_json(ws, { range: 2 });
let count = 0;
for(let row of data) {
  for(let key of Object.keys(row)) {
    if(key.includes("Anfahrt")) {
      console.log(`Row has ${key} = ${row[key]}`);
      count++;
    }
  }
}
console.log("Total rows with Anfahrt:", count);
