const fs = require('fs');
let pageCode = fs.readFileSync('src/app/import/page.tsx', 'utf8');

pageCode = pageCode.replace(
  'const result = await saveHistoricalExcelData(plainRows);',
  'const result = await saveHistoricalExcelData(plainRows, priceOverridesMap);'
);

fs.writeFileSync('src/app/import/page.tsx', pageCode, 'utf8');
