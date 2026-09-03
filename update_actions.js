const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

code = code.replace(
  'bdeStatus?: string,\n  materialDetails?: string\n) {',
  'bdeStatus?: string,\n  materialDetails?: string,\n  vehicle?: string\n) {'
);

code = code.replace(
  'technicianRemark,\n      isBilled: true,',
  'technicianRemark,\n      isBilled: true,\n      ...(vehicle !== undefined && { vehicle }),'
);

fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
console.log("Updated actions.ts");
