const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

code = code.replace(
  'const plainRows = JSON.parse(JSON.stringify(excelRows));',
  'const plainRows = JSON.parse(JSON.stringify(excelRows));\n        console.log("PRICE OVERRIDES WHEN SAVING:", priceOverridesMap);'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
