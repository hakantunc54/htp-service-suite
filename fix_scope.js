const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /const getRelevantServiceItems = \(\) => \{/m;
const newRegex = `const isBDE = billingOrder ? ((billingOrder.orderType || "").toLowerCase().includes("bde") || (billingOrder.orderType || "").toLowerCase().includes("endleitung") || billingOrder.vosNumber) : false;
  
    const getRelevantServiceItems = () => {`;
code = code.replace(regex, newRegex);

// Remove the local one inside getRelevantServiceItems
const localRegex = /const isBDE = \(billingOrder\.orderType \|\| ""\)\.toLowerCase\(\)\.includes\("bde"\) \|\|\s*\(billingOrder\.orderType \|\| ""\)\.toLowerCase\(\)\.includes\("endleitung"\) \|\|\s*billingOrder\.vosNumber;\s*\/\/ BDE usually has vosNumber/m;
code = code.replace(localRegex, '');

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed scope of isBDE");
