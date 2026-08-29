const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');
code = code.replace('firstThursday - dt', 'firstThursday - dt.valueOf()');
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed TS");
