const fs = require('fs');

let content = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8');

content = content.replace(
  /const newOrderValue = servicesToSave\.reduce\(\(sum, item\) => sum \+ \(item\.priceApplied \* item\.quantity\), 0\);/g,
  'const newOrderValue = servicesToSave.reduce((sum, item) => sum + (item.priceApplied || 0), 0);'
);

fs.writeFileSync('src/app/orders/[id]/actions.ts', content, 'utf8');
console.log("updateOrderServices fixed.");
