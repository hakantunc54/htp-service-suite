const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8');

const regex = /content: "Kunde telefonisch erreicht"/m;
const newContent = `content: "?? Ausgehender Anruf (Ergebnis offen)"`;

code = code.replace(regex, newContent);
fs.writeFileSync('src/app/terminabsprachen/actions.ts', code, 'utf8');
console.log("Updated logCall in actions.ts");
