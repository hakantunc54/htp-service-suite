const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const oldPush = `if (isVariable && optionalValue > 0) {
        itemsToSave.push({ serviceItemId: item.id, quantity: 1, amount: optionalValue });
      } else if (q > 0) {
        itemsToSave.push({ serviceItemId: item.id, quantity: q, amount: (item.defaultPrice || 0) * q });
      }`;

const newPush = `if (isVariable && optionalValue > 0) {
        itemsToSave.push({ serviceItemId: item.id, quantity: 1, amount: optionalValue });
      } else if (q > 0) {
        itemsToSave.push({ serviceItemId: item.id, quantity: q, amount: item.defaultPrice || 0 });
      }`;

code = code.replace(oldPush, newPush);
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
