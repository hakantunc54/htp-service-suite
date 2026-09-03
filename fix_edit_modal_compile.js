const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

const regex = /newServices\.push\(\{\s*id: `temp-\$\{Date\.now\(\)\}`,\s*orderId: order\.id,\s*serviceItemId: itemId,\s*quantity: qty,\s*priceApplied: defaultPrice\s*\}\);/g;

code = code.replace(regex, `newServices.push({ serviceItemId: itemId, quantity: qty, priceApplied: defaultPrice || 0 });`);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Fixed EditServicesModal compile error");
