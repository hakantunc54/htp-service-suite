const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

// The regex will find `const isBde = sheetName.toUpperCase().includes('BDE');`
// and replace it with a proper check that includes the headers.
code = code.replace(
  /const isBde = sheetName\.toUpperCase\(\)\.includes\('BDE'\);/g,
  'const headerStr = JSON.stringify(rawData[headerRowIndex] || []).toUpperCase();\n              const isBde = sheetName.toUpperCase().includes("BDE") || headerStr.includes("ARBEITSZEIT") || headerStr.includes("MATERIAL");'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
