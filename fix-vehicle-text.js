const fs = require("fs");
let content = fs.readFileSync("src/app/orders/page.tsx", "utf8");

content = content.replace(/>T 1 \(BDE\)/g, '>T1 (BDE)');
content = content.replace(/>T 2 \(BDE\)/g, '>T2 (BDE)');
content = content.replace(/>T 3 \(BDE\)/g, '>T3 (BDE)');
content = content.replace(/>T 4 \(BDE\)/g, '>T4 (BDE)');

fs.writeFileSync("src/app/orders/page.tsx", content, "utf8");
console.log("Fixed vehicle text.");
