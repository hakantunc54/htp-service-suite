const fs = require('fs');
const lines = fs.readFileSync('src/app/planning/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('lösch') || l.toLowerCase().includes('trash') || l.toLowerCase().includes('delete')) {
    console.log(i, l);
  }
});
