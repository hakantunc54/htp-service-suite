const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

// For the BDE rows section, we replace "Stunden / Material": "",
const regex = /"Stunden \/ Material": "",/m;
code = code.replace(regex, `"Stunden / Material": order.materialDetails || "",`);

// And the status line in BDE rows section
const bdeStatusRegex = /"Status": \(Number\(getQty\("Abbruch"\)\) > 0 \|\| Number\(getQty\("KvHdF"\)\) > 0\) \? "Abgebrochen" : "Erledigt",\s*"Bemerkung": order\.technicianRemark \|\| "",\s*"WE\\nLage": order\.apartmentLocation \|\| "",\s*"Stunden \/ Material": order\.materialDetails \|\| "",/m;
const newBdeStatus = `"Status": order.bdeStatus || "Erledigt",
            "Bemerkung": order.technicianRemark || "",
            "WE\\nLage": order.apartmentLocation || "",
            "Stunden / Material": order.materialDetails || "",`;
code = code.replace(bdeStatusRegex, newBdeStatus);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
console.log("Updated export-billing route");
