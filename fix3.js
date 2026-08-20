const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

const replacement = `
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          // Lese als 2D Array um die Header-Zeile zu finden
          const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
          
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(rawData.length, 20); i++) {
            const rowArr = rawData[i] || [];
            const rowStr = rowArr.join(" ").toLowerCase();
            if (rowStr.includes("plz") || rowStr.includes("kunde") || rowStr.includes("termin")) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex >= 0) {
            // Generiere JSON ab der gefundenen Header-Zeile
            const data = xlsx.utils.sheet_to_json(ws, { range: headerRowIndex });
            
            const isBde = sheetName.toUpperCase().includes('BDE');
            const isFttb = sheetName.toUpperCase().includes('FTTB');
            
            data.forEach((r: any) => r._SourceType = isBde ? "BDE" : "FTTB");
            
            allRows = allRows.concat(data);
            if (isBde) bdeCount += data.length;
            else fttbCount += data.length;
          }
        });
`;

code = code.replace(/wb\.SheetNames\.forEach[\s\S]*?(?=\s*setExcelStats)/, replacement);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
