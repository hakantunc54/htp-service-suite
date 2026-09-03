const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

const regex = /Number\(getQty\("Abbruch"\)\)/g;
code = code.replace(regex, `Number(getQty("Abbruch").toString().replace(',', '.'))`);

const regex2 = /Number\(getQty\("KvHdF"\)\)/g;
code = code.replace(regex2, `Number(getQty("KvHdF").toString().replace(',', '.'))`);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
console.log("Updated CSV export Number checks");
