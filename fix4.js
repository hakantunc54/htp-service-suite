const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');
code = code.replace('const rowArr = rawData[i] || [];', 'const rowArr = (rawData[i] as any[]) || [];');
fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
