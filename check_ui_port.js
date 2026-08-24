const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
if (code.includes('Port')) {
  console.log("Port found in UI");
  const lines = code.split('\n');
  lines.forEach((l, i) => { if (l.includes('Port')) console.log(i, l); });
} else {
  console.log("No Port in UI");
}
