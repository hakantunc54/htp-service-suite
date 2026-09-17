const fs = require('fs');

let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');
content = content.replace(/Bitte alte Aktennotizen und Material pr.fen!/g, 'Bitte alte Aktennotizen und Material prüfen!');
content = content.replace(/Bitte alte Aktennotizen pr.fen!/g, 'Bitte alte Aktennotizen prüfen!');
fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');

let planning = fs.readFileSync('src/app/planning/actions.ts', 'utf8');
planning = planning.replace(
  /notIn: \["Erfolgreich abgeschlossen", "Storniert"/,
  'notIn: ["Erfolgreich abgeschlossen", "Storniert", "Abbruch"'
);
fs.writeFileSync('src/app/planning/actions.ts', planning, 'utf8');

console.log('Successfully fixed encoding and planning actions!');
