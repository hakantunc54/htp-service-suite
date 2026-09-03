const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/page.tsx', 'utf8').split('\n');
for(let i = 230; i < 255; i++) console.log(i, lines[i]);
