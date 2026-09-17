const fs = require('fs');
let content = fs.readFileSync('src/app/api/fix-prices/route.ts', 'utf8');

// Replace the restrictive if condition with a robust recalculation logic
content = content.replace(
  /if \(item\.priceApplied !== expectedTotal && item\.priceApplied === item\.serviceItem\.defaultPrice && item\.quantity > 1\) \{/g,
  'if (item.priceApplied !== expectedTotal) {'
);

fs.writeFileSync('src/app/api/fix-prices/route.ts', content, 'utf8');
console.log("fix-prices updated to be more aggressive.");
