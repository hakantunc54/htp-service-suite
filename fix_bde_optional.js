const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

// We need to determine isBde BEFORE we loop over the header row for priceOverrides!
// Currently, parsePriceLogic is executed before the header row is found? No, parsePriceLogic is executed when headerRowIndex is found.
// Let's replace the whole `if (rawData.length > 2 && headerRowIndex > 0)` block.

code = code.replace(
  'if (colName === "optional" && sheetName.toUpperCase().includes("BDE")) targetName = "Optional (BDE)";',
  'const hdrStr = JSON.stringify(headerRow).toUpperCase();\n                    const isBdeSheet = sheetName.toUpperCase().includes("BDE") || hdrStr.includes("ARBEITSZEIT") || hdrStr.includes("MATERIAL");\n                    if (colName === "optional" && isBdeSheet) targetName = "Optional (BDE)";'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
