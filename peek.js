const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const idx = code.indexOf('type="number" \n                              min="0"');
const idx2 = code.indexOf('type="number" \r\n                              min="0"');
const idx3 = code.indexOf('type="number"');

console.log(idx, idx2, idx3);
if (idx3 !== -1) {
    console.log(JSON.stringify(code.substring(idx3, idx3 + 100)));
}

