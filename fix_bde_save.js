const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

const regex = /technicianRemark,\n\s*\.\.\.\(vehicle !== undefined && \{ vehicle \}\)\n\s*\}/;

if (regex.test(code)) {
    code = code.replace(regex, 'technicianRemark,\n          ...(vehicle !== undefined && { vehicle }),\n          ...(bdeStatus !== undefined && { bdeStatus }),\n          ...(materialDetails !== undefined && { materialDetails })\n        }');
    fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
    console.log("Fixed BDE save");
} else {
    console.log("Regex didn't match");
}
