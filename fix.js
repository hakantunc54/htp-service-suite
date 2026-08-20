const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

code = code.replace(
  'const result = await saveHistoricalExcelData(excelRows);',
  'const plainRows = JSON.parse(JSON.stringify(excelRows));\n      const result = await saveHistoricalExcelData(plainRows);'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
