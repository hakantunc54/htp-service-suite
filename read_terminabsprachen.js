const fs = require('fs');
const lines = fs.readFileSync('src/app/terminabsprachen/page.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('prisma.order.findMany'));
for(let i = idx; i < idx + 20; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
