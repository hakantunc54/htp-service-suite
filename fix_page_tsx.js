const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

const oldLogic = `        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          // Lese als 2D Array um die Header-Zeile zu finden
          const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
          
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(rawData.length, 20); i++) {
            const rowArr = (rawData[i] as any[]) || [];
            const rowStr = rowArr.join(" ").toLowerCase();
            if (rowStr.includes("plz") || rowStr.includes("kunde") || rowStr.includes("termin")) {
              headerRowIndex = i;
              break;
            }
          }`;

const newLogic = `        const localOverrides: Record<string, number> = {};
        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          // Lese als 2D Array um die Header-Zeile zu finden
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
                  let targetName = columnMap[colName];
                  if (colName === "optional" && sheetName.toUpperCase().includes("BDE")) targetName = "Optional (BDE)";
                  if (targetName) {
                     localOverrides[targetName] = parseFloat(String(priceRow[c]).replace(',', '.'));
                  }
               }
            }
          }`;

code = code.replace(oldLogic, newLogic);

const oldStats = `        setExcelStats({ fttb: fttbCount, bde: bdeCount, total: fttbCount + bdeCount });`;
const newStats = `        setExcelStats({ fttb: fttbCount, bde: bdeCount, total: fttbCount + bdeCount });\n        setPriceOverridesMap(localOverrides);`;

code = code.replace(oldStats, newStats);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
