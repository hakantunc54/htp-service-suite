const fs = require('fs');

// 1. Update actions.ts
let actionsCode = fs.readFileSync('src/app/import/actions.ts', 'utf8');

actionsCode = actionsCode.replace(
  'export async function saveHistoricalExcelData(rows: any[]) {',
  'export async function saveHistoricalExcelData(rows: any[], priceOverrides?: Record<string, number>) {'
);

const priceLogic = `
          if (targetName) {
            const si = serviceItems.find(i => i.name === targetName);
            if (si) {
              let priceToApply = 0;
              let qty = itemVal;

              const customPrice = (priceOverrides && priceOverrides[targetName] !== undefined) ? priceOverrides[targetName] : si.defaultPrice;

              if (targetName.toLowerCase().includes("optional") || targetName.toLowerCase().includes("material")) {
                 priceToApply = (customPrice || 0) * qty;
              } else {
                 priceToApply = (customPrice || 0) * qty;
              }
`;

// Replace the block
actionsCode = actionsCode.replace(
  /          if \(targetName\) {[\s\S]*?\} else {[\s\S]*?priceToApply = \(si\.defaultPrice \|\| 0\) \* qty;\n              }/,
  priceLogic
);

fs.writeFileSync('src/app/import/actions.ts', actionsCode, 'utf8');


// 2. Update page.tsx
let pageCode = fs.readFileSync('src/app/import/page.tsx', 'utf8');

// Add global state for priceOverrides
if (!pageCode.includes('const [priceOverridesMap, setPriceOverridesMap]')) {
  pageCode = pageCode.replace(
    'const [excelStats, setExcelStats] = useState({ fttb: 0, bde: 0, total: 0 });',
    'const [excelStats, setExcelStats] = useState({ fttb: 0, bde: 0, total: 0 });\n  const [priceOverridesMap, setPriceOverridesMap] = useState<Record<string, number>>({});'
  );
}

const parseLogic = `
          const localOverrides: Record<string, number> = {};
          
          wb.SheetNames.forEach(sheetName => {
            const ws = wb.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
            
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
              const rowArr = (rawData[i] as any[]) || [];
              const rowStr = rowArr.join(" ").toLowerCase();
              if (rowStr.includes("plz") || rowStr.includes("kunde") || rowStr.includes("termin")) {
                headerRowIndex = i;
                break;
              }
            }

            // Extract prices from 2 rows above the header
            if (headerRowIndex >= 2) {
              const priceRow = (rawData[headerRowIndex - 2] as any[]) || [];
              const headerRow = (rawData[headerRowIndex] as any[]) || [];
              for (let c = 0; c < headerRow.length; c++) {
                 if (priceRow[c] && !isNaN(parseFloat(String(priceRow[c]).replace(',', '.')))) {
                    const colName = String(headerRow[c]);
                    const columnMap: Record<string, string> = {
                      "FTTB": "FTTB", "Abbruch": "Abbruch", "Anfahrt >12": "Anfahrt >12",
                      "Anfahrt\\n<12": "Anfahrt <12", "Anfahrt\\r\\n<12": "Anfahrt <12", "Anfahrt <12": "Anfahrt <12",
                      "MAW (5Min)": "MAW (5Min)", "PCI": "PCI", "vLauiAPLe": "vLauiAPLe",
                      "Warten 5Min": "Warten 5Min", "Warten 10Min": "Warten 10Min",
                      "fZugang DPU/APL": "fZugang DPU/APL", "KvHdF": "KvHdF", "Dispo": "Dispo",
                      "optional": "Optional / Material (FTTB)", "Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",
                    };
                    let targetName = columnMap[colName] || (colName === "optional" && sheetName.toUpperCase().includes("BDE") ? "Optional (BDE)" : columnMap[colName]);
                    if (targetName) {
                       localOverrides[targetName] = parseFloat(String(priceRow[c]).replace(',', '.'));
                    }
                 }
              }
            }
`;

// Replace the parsing block
pageCode = pageCode.replace(
  /          wb\.SheetNames\.forEach\(sheetName => {[\s\S]*?let headerRowIndex = -1;[\s\S]*?break;\n              }\n            }/,
  parseLogic
);

// Save the state
pageCode = pageCode.replace(
  'setExcelStats({ fttb: fttbCount, bde: bdeCount, total: fttbCount + bdeCount });',
  'setExcelStats({ fttb: fttbCount, bde: bdeCount, total: fttbCount + bdeCount });\n          setPriceOverridesMap(localOverrides);'
);

// Call with overrides
pageCode = pageCode.replace(
  'const result = await saveHistoricalExcelData(excelRows);',
  'const result = await saveHistoricalExcelData(excelRows, priceOverridesMap);'
);

fs.writeFileSync('src/app/import/page.tsx', pageCode, 'utf8');
