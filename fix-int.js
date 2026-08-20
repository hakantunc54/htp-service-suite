const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

code = code.replace(
  'const custNum = row["Kunden Nummer"] ||',
  'let custNum = row["Kunden Nummer"] ||'
);
code = code.replace(
  'const phone = row["Kunde RufNr"] || row["Telefon"] || "";',
  'if (custNum) custNum = String(custNum);\n        const phone = row["Kunde RufNr"] || row["Telefon"] || "";'
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
