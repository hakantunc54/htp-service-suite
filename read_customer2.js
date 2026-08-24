const fs = require('fs');
const code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
const lines = code.split('\n');
for(let i = 165; i < 175; i++) console.log(i, lines[i]);
