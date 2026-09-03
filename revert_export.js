const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

const regex = /return item \? item\.quantity\.toString\(\)\.replace\('\.', ','\) : '';/g;
code = code.replace(regex, `return item ? item.quantity : '';`);

const regex2 = /Number\(getQty\("Abbruch"\)\.toString\(\)\.replace\(',', '\.'\)\)/g;
code = code.replace(regex2, `Number(getQty("Abbruch"))`);

const regex3 = /Number\(getQty\("KvHdF"\)\.toString\(\)\.replace\(',', '\.'\)\)/g;
code = code.replace(regex3, `Number(getQty("KvHdF"))`);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
console.log("Reverted CSV export to native numbers");
