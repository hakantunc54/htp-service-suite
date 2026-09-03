const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('lösch') || l.toLowerCase().includes('stornier') || l.toLowerCase().includes('delete')) {
    console.log(i, l);
  }
});
