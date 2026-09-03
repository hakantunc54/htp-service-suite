const fs = require('fs');
const lines = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('status: {'));
for(let i = idx; i < idx + 15; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
