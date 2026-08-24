const fs = require('fs');
const code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => { if(l.includes('Port')) console.log(i, l) });
