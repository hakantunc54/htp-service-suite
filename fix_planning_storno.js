const fs = require('fs');

let content = fs.readFileSync('src/app/planning/actions.ts', 'utf8');

content = content.replace(
  /notIn: \["Erfolgreich abgeschlossen", "Storniert", "Abbruch", "Abgerechnet", "Archiviert", "Termin abstimmen"\]/,
  'notIn: ["Erfolgreich abgeschlossen", "Storniert", "Storno HTP", "Abbruch", "Abgerechnet", "Archiviert", "Termin abstimmen"]'
);

fs.writeFileSync('src/app/planning/actions.ts', content, 'utf8');
console.log("Storno HTP added to planning exclusion list.");
