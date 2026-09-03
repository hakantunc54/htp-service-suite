const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');
code = code.replace(
  'status: "Wartet auf HTP"',
  'status: "Neu"'
);
fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
