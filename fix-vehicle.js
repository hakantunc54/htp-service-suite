const fs = require("fs");
let content = fs.readFileSync("src/app/orders/page.tsx", "utf8");

content = content.replace(/value="T 1"/g, 'value="T1"');
content = content.replace(/value="T 2"/g, 'value="T2"');
content = content.replace(/value="T 3"/g, 'value="T3"');
content = content.replace(/value="T 4"/g, 'value="T4"');

fs.writeFileSync("src/app/orders/page.tsx", content, "utf8");
console.log("Fixed vehicle values.");
