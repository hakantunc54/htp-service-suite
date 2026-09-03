const fs = require('fs');
let code = fs.readFileSync('src/app/billing/page.tsx', 'utf8');

// Fix imports
if (!code.includes('import { deleteOrder }')) {
  code = code.replace(
    'import { Calculator, Download, Calendar } from "lucide-react";',
    'import { Calculator, Download, Calendar, Trash2 } from "lucide-react";\nimport { deleteOrder } from "../orders/actions";'
  );
}

// Fix fetchBilledOrders -> fetchBillingData
// Let's check what the function is actually called
const fetchMatch = code.match(/const (\w+) = async \(\) => \{\n\s*setLoading\(true\);\n\s*const data = await getBillingData/);
if (fetchMatch) {
    const fetchFunc = fetchMatch[1];
    code = code.replace(/await fetchBilledOrders\(startDate, endDate\);/, `await ${fetchFunc}();`);
} else {
    // If it takes params
    const fetchMatch2 = code.match(/const (\w+) = async \([^)]*\) => \{\n\s*setLoading\(true\);\n\s*const data = await getBillingData/);
    if (fetchMatch2) {
         code = code.replace(/await fetchBilledOrders\(startDate, endDate\);/, `await ${fetchMatch2[1]}();`);
    } else {
         // just replace it with the name used in useEffect
         const effectMatch = code.match(/useEffect\(\(\) => \{\n\s*(\w+)\(\);/);
         if (effectMatch) {
             code = code.replace(/await fetchBilledOrders\(startDate, endDate\);/, `await ${effectMatch[1]}();`);
         }
    }
}

fs.writeFileSync('src/app/billing/page.tsx', code, 'utf8');
console.log("Fixed billing page");
