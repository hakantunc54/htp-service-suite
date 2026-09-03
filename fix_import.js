const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');
code = 'import { getTerminabsprachen } from "./terminabsprachen/actions";\n' + code;
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
console.log("Added import");
