const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('Folgeauftrag (Klon) wurde erstellt'));
for(let i = idx - 5; i < idx + 5; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
