const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

const target = '"Status": (Number(getQty("Abbruch")) > 0 || Number(getQty("KvHdF")) > 0) ? "Abgebrochen" : "Erledigt"';
const replace = '"Status": (Number(getQty("Abbruch")) > 0 || Number(getQty("KvHdF")) > 0) ? "Abbruch" : "Erledigt"';

code = code.replace(target, replace);
code = code.replace(target, replace); // twice in case of fttb and bde? No, BDE uses order.bdeStatus

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
console.log("Fixed status");
