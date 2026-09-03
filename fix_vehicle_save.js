const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

const regex = /apartmentLocation,\s*technicianRemark\s*\}/;

if (regex.test(code)) {
    code = code.replace(regex, 'apartmentLocation,\n        technicianRemark,\n        ...(vehicle !== undefined && { vehicle })\n      }');
    fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
    console.log("Fixed vehicle save");
} else {
    console.log("Regex didn't match");
}
