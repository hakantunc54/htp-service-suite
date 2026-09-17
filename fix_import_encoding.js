const fs = require('fs');

let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// The replacement character in JS when reading invalid UTF-8 might be \uFFFD
content = content.replace(/Bitte alte Aktennotizen und Material pr\uFFFDfen!/g, 'Bitte alte Aktennotizen und Material prüfen!');
content = content.replace(/Bitte alte Aktennotizen pr\uFFFDfen!/g, 'Bitte alte Aktennotizen prüfen!');
content = content.replace(/Notizen pr\u01ECfen\./g, 'Notizen prüfen.'); // 'prOfen'

// Just to be absolutely safe, let's also do a blanket replace for 'pr<something>fen'
content = content.replace(/pr[^f]{1,3}fen/g, 'prüfen');
content = content.replace(/Geb[^u]{1,3}ude/g, 'Gebäude');

fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log('Fixed encoding!');
