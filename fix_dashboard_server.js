const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');
code = code.replace(/"use client";\r?\n?/g, '');
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
