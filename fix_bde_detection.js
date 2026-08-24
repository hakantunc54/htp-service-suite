const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

const replacement = `
            const headerStr = JSON.stringify(headerRow).toUpperCase();
            const isBde = sheetName.toUpperCase().includes('BDE') || headerStr.includes("ARBEITSZEIT") || headerStr.includes("MATERIAL") || headerStr.includes("STUNDEN");
            const isFttb = !isBde;
`;

code = code.replace(
  "const isBde = sheetName.toUpperCase().includes('BDE');\n              const isFttb = sheetName.toUpperCase().includes('FTTB');",
  replacement
);
fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
