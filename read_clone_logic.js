const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('export async function cloneOrder'));
for(let i = idx; i < idx + 40; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
