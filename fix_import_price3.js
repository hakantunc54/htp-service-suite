const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// We can just replace "priceApplied: priceToApply" with "priceApplied: priceToApply * qty"
// And "totalValue += priceToApply;" with "totalValue += priceToApply * qty;"

content = content.replace(/priceApplied: priceToApply/g, 'priceApplied: priceToApply * qty');
content = content.replace(/totalValue \+= priceToApply;/g, 'totalValue += priceToApply * qty;');

fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log("Import logic fixed with simple replace.");
