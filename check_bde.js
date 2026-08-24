const xlsx = require('xlsx');
const filePath = "C:\\Users\\Hakan\\Desktop\\MAIL BOXENSTOP\\005 CRM\\FTTB - Auftragsbearbeitung Netzbetrieb Januar 2026 - Kopie.xlsx";
const workbook = xlsx.readFile(filePath);
const bdeSheetName = workbook.SheetNames.find(s => s.toUpperCase().includes('BDE'));

if (bdeSheetName) {
  const ws = workbook.Sheets[bdeSheetName];
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
  let headerRow = [];
  for (let i = 0; i < 15; i++) {
    if ((data[i] || []).join("").toLowerCase().includes("plz")) {
      headerRow = data[i];
      break;
    }
  }
  console.log("BDE Headers:", headerRow);
} else {
  console.log("No BDE sheet found");
}
