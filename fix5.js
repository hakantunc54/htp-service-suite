const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

code = code.replace(
  'if (!row["Kunde Name"] && !row["Kunden Name"]) continue; // Leere Zeile ueberspringen',
  'const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];\n      if (!custName) continue;'
);

code = code.replace(
  'const custName = row["Kunde Name"] || row["Kunden Name"] || "Unbekannt";',
  '// custName already defined above'
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
