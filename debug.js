const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const replacement = `
      const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
      if (!custName) {
        console.log("Skipped row due to missing name:", JSON.stringify(row).substring(0, 100));
        continue;
      }
`;

code = code.replace(
  'const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];\n      if (!custName) continue;',
  replacement
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
