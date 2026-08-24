const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');
code = code.replace(/\uFFFD/g, ''); // Remove replacement char
code = code.replace(/^\uFEFF/, ''); // Remove BOM if exists
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
