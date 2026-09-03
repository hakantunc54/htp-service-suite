const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

code = code.replace(
  'step={item.name.toLowerCase().includes("arbeitszeit") ? "0.25" : "1"}', 
  'step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}'
);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Updated orders/page.tsx");
