const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('Auftrag klonen'));
for(let i = idx - 10; i < idx + 10; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
