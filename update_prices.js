const fs = require('fs');

// 1. Update actions.ts to accept priceOverrides
let actionsCode = fs.readFileSync('src/app/import/actions.ts', 'utf8');
actionsCode = actionsCode.replace(
  'export async function saveHistoricalExcelData(rows: any[]) {',
  'export async function saveHistoricalExcelData(rows: any[], priceOverrides?: Record<string, number>) {'
);

actionsCode = actionsCode.replace(
  'let priceToApply = 0;',
  'let priceToApply = 0;\n              const customPrice = priceOverrides && priceOverrides[targetName] !== undefined ? priceOverrides[targetName] : si.defaultPrice;'
);

actionsCode = actionsCode.replace(
  'priceToApply = (si.defaultPrice || 0) * qty;',
  'priceToApply = (customPrice || 0) * qty;'
);

// Fallback for non-optional items:
actionsCode = actionsCode.replace(
  '} else {\n                 priceToApply = (si.defaultPrice || 0) * qty;\n              }',
  '} else {\n                 priceToApply = (customPrice || 0) * qty;\n              }'
);

fs.writeFileSync('src/app/import/actions.ts', actionsCode, 'utf8');

// 2. Update page.tsx to extract prices from Row 0 and pass them
let pageCode = fs.readFileSync('src/app/import/page.tsx', 'utf8');

const parsePriceLogic = `
          // Versuche Preise aus Zeile 0 oder 1 zu lesen
          const priceOverrides: Record<string, number> = {};
          if (rawData.length > 2 && headerRowIndex > 0) {
            const priceRow = rawData[headerRowIndex - 2] || [];
            const headerRow = rawData[headerRowIndex] || [];
            for (let c = 0; c < headerRow.length; c++) {
              if (priceRow[c] && !isNaN(parseFloat(String(priceRow[c])))) {
                const colName = headerRow[c];
                // Wir mssen das wie beim Import mappen
                const columnMap: Record<string, string> = {
                  "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
                  "Anfahrt\\n<12": "Anfahrt <12", "Anfahrt\\r\\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
                  "MAW (5Min)": "MAW (5Min)", "PCI": "PCI", "vLauiAPLe": "vLauiAPLe",
                  "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
                  "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
                  "optional": "Optional / Material (FTTB)", "Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",
                };
                let mapped = columnMap[colName];
                if (colName === "optional" && isBde) mapped = "Optional (BDE)";
                if (mapped) {
                  priceOverrides[mapped] = parseFloat(String(priceRow[c]));
                }
              }
            }
          }
`;

pageCode = pageCode.replace(
  'const isBde = sheetName.toUpperCase().includes(\'BDE\');',
  'const isBde = sheetName.toUpperCase().includes(\'BDE\');' + parsePriceLogic
);

pageCode = pageCode.replace(
  'const result = await saveHistoricalExcelData(excelRows);',
  'const result = await saveHistoricalExcelData(excelRows, priceOverridesMap);'
);

// We need to store priceOverridesMap in state or calculate it globally for the file.
// Since we process multiple sheets, let's just merge them in allRows somehow, or simpler:
