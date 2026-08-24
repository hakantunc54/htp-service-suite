const fs = require('fs');
const code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => { if(l.includes('customer.address') || l.includes('customer.phone')) console.log(i, l) });
