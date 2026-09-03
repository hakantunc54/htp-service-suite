const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');
const idx = code.indexOf('WE-Lage</label>');
if (idx !== -1) {
    console.log(JSON.stringify(code.substring(idx - 150, idx + 20)));
}
