const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

if (!code.includes('setExcelStats({ fttb: fttbCount, bde: bdeCount, total: allRows.length });')) {
   throw new Error("Could not find the target string!");
}

code = code.replace(
  'setExcelStats({ fttb: fttbCount, bde: bdeCount, total: allRows.length });',
  'setExcelStats({ fttb: fttbCount, bde: bdeCount, total: allRows.length });\n        setPriceOverridesMap(localOverrides);'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
console.log('Fixed successfully!');
