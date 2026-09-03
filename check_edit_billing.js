const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('ERFASSTE LEISTUNGEN'));
for(let i = idx - 5; i < idx + 20; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
