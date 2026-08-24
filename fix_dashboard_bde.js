const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldLogic = `const type = (o.orderType || "").toLowerCase().includes("bde") ? "BDE" : "FTTB";`;
const newLogic = `const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      const type = isBDE ? "BDE" : "FTTB";`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
