const xlsx = require('xlsx');
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);
const ws = workbook.Sheets[workbook.SheetNames[0]];
const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
for(let i=0; i<5; i++) {
  console.log(`Row ${i}:`, rawData[i]);
}
