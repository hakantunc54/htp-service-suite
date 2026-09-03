const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('klon') || l.toLowerCase().includes('clone') || l.toLowerCase().includes('duplizier')) {
    console.log("page.tsx", i, l);
  }
});
