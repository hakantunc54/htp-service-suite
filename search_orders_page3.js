const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('quantity')) console.log(i, l);
});
