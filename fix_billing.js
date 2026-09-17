const fs = require('fs');
let content = fs.readFileSync('src/app/billing/actions.ts', 'utf8');
content = content.replace(/status: "Erfolgreich abgeschlossen"/, 'status: { in: ["Erfolgreich abgeschlossen", "Abbruch"] }');
fs.writeFileSync('src/app/billing/actions.ts', content, 'utf8');
console.log("Fixed billing actions");
