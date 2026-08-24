const fs = require('fs');
let code = fs.readFileSync('src/app/billing/actions.ts', 'utf8');
code = code.replace('customer: true', 'customer: true,\n      serviceItems: { include: { serviceItem: true } }');
fs.writeFileSync('src/app/billing/actions.ts', code, 'utf8');
