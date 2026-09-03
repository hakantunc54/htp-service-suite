const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('<Plus ')) console.log(i, l);
  if (l.includes('const handleUpdateQuantity')) console.log("Found handleUpdateQuantity at", i);
});
