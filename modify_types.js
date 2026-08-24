const fs = require('fs');

// 1. Mod types
let typesCode = fs.readFileSync('src/types/index.ts', 'utf8');
typesCode = typesCode.replace('ARCHIVIERT = "Archiviert"', 'ARCHIVIERT = "Archiviert",\n  WARTET_AUF_HTP = "Wartet auf HTP"');
fs.writeFileSync('src/types/index.ts', typesCode, 'utf8');

// 2. Mod Terminabsprachen actions
let termCode = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8');
termCode = termCode.replace('"Kunde hat zur\\u01ecckgerufen"', '"Kunde hat zur\\u01ecckgerufen",\n          "Wartet auf HTP"');
fs.writeFileSync('src/app/terminabsprachen/actions.ts', termCode, 'utf8');
