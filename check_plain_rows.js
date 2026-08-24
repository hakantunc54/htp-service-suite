const xlsx = require('xlsx');
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);
const ws = workbook.Sheets[workbook.SheetNames[0]];

const data = xlsx.utils.sheet_to_json(ws, { range: 2 });
console.log("Keys of first data row:", Object.keys(data[0]));
