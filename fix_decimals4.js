const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const target = 'type="number" \r\n                              min="0"';
const replace = 'type="number" \r\n                              min="0"\r\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}';

// In case it's just \n
const target2 = 'type="number" \n                              min="0"';
const replace2 = 'type="number" \n                              min="0"\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}';


code = code.replace(target, replace).replace(target2, replace2);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed decimals 4");
