const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

// Insert grouping logic after sorting
const groupLogic = `
    fttbRows.sort(sortRows);
    bdeRows.sort(sortRows);

    // Fge visuelle Trennlinien (leere Zeilen) zwischen Tagen und Autos ein
    const insertGaps = (rows: any[]) => {
      if (rows.length === 0) return rows;
      const newRows = [];
      let lastDate = rows[0].Termin;
      let lastTech = rows[0].Techniker;
      
      for (const row of rows) {
        if (row.Termin !== lastDate) {
          // Neuer Tag! 2 leere Zeilen
          newRows.push({});
          newRows.push({});
          lastDate = row.Termin;
          lastTech = row.Techniker;
        } else if (row.Techniker !== lastTech) {
          // Gleicher Tag, aber neues Auto! 1 leere Zeile
          newRows.push({});
          lastTech = row.Techniker;
        }
        newRows.push(row);
      }
      return newRows;
    };

    const groupedFttbRows = insertGaps(fttbRows);
    const groupedBdeRows = insertGaps(bdeRows);

    // Workbook erstellen
`;

code = code.replace(
  /    fttbRows\.sort\(sortRows\);\n    bdeRows\.sort\(sortRows\);\n\n    \/\/ Workbook erstellen/m,
  groupLogic
);

// Update json_to_sheet arguments
code = code.replace(
  'const wsFTTB = xlsx.utils.json_to_sheet(fttbRows);',
  'const wsFTTB = xlsx.utils.json_to_sheet(groupedFttbRows);'
);
code = code.replace(
  'const wsBDE = xlsx.utils.json_to_sheet(bdeRows);',
  'const wsBDE = xlsx.utils.json_to_sheet(groupedBdeRows);'
);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
