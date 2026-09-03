const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/page.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('Abrechnung abschlieﬂen'));
for(let i = idx - 10; i < idx + 20; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
