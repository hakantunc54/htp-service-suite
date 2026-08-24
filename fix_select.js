const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');
code = code.replace(
  `select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true }`,
  `select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true }`
);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
