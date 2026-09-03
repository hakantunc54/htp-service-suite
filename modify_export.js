const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

// BDE Export Status
const bdeStatusRegex = /"Status": \(Number\(getQty\("Abbruch"\)\) > 0 \|\| Number\(getQty\("KvHdF"\)\) > 0\) \? "Abgebrochen" : "Erledigt",/m;
const newBdeStatus = `"Status": order.bdeStatus || ((Number(getQty("Abbruch")) > 0 || Number(getQty("KvHdF")) > 0) ? "Abgebrochen" : "Erledigt"),`;
code = code.replace(bdeStatusRegex, newBdeStatus); // Note: it appears twice in the file, one for FTTB one for BDE, but replace() replaces only first if not /g. I should use replaceAll or target the specific one.

// Wait, the first one is FTTB, so we probably only want it on the BDE loop!
