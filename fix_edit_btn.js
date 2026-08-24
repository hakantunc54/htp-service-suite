const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

code = code.replace(
  '{(!order.isBilled) && (\n                <button',
  '{true && (\n                <button'
);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
