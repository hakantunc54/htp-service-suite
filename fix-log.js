const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const replacement = `
      // LOG ROW FOR DEBUGGING
      if (importedCount === 0) {
        require('fs').writeFileSync('last_excel_row.json', JSON.stringify(row, null, 2));
      }
      if (!row["Kunde Name"] && !row["Kunden Name"] && !row["Kunde"] && !row["Name"]) continue;
`;

code = code.replace(
  'if (!custName) continue;',
  replacement
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
