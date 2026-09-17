const fs = require('fs');

let content = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

content = content.replace(
  /\{(\(\(s\.priceApplied \|\| 0\) \* s\.quantity\))\.toFixed\(2\)\.replace\('\.', ','\)\}/g,
  '{(s.priceApplied || 0).toFixed(2).replace(".", ",")}'
);

fs.writeFileSync('src/app/orders/[id]/page.tsx', content, 'utf8');
console.log("Order Details UI fixed.");
