const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

code = code.replace(
  'include: {\n      customer: true\n    }',
  'include: {\n      customer: true,\n      services: true\n    }'
);

fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
console.log("Updated getOrders");
