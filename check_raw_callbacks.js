const fs = require('fs');
const lines = fs.readFileSync('src/app/page.tsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('const rawCallbacks ='));
for(let i = idx - 5; i < idx + 25; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
