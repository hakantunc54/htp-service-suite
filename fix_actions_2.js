const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

code = code.replace(
  'priceToApply = (si.defaultPrice || 0) * qty;',
  'const customPrice = (priceOverrides && priceOverrides[targetName] !== undefined) ? priceOverrides[targetName] : (si.defaultPrice || 0);\n                 priceToApply = customPrice * qty;'
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
