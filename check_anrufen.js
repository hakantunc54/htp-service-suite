const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('Anrufen')) console.log(i, l);
});
