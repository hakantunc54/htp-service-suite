const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// The bug is: priceToApply = customPrice * qty AND then priceApplied = priceToApply * qty.
// We must change priceToApply = customPrice;
content = content.replace(
  /priceToApply = customPrice \* qty;/g,
  'priceToApply = customPrice;'
);

fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log("Fixed double multiplication in import script.");
