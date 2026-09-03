const fs = require('fs');
let code = fs.readFileSync('src/app/billing/page.tsx', 'utf8');
code = code.replace('await fetchBillingData();', 'await fetchData();');
fs.writeFileSync('src/app/billing/page.tsx', code, 'utf8');
