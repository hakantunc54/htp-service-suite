const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

const regex = /"KvHdF": getQty\("KvHdF"\),\s*"DPU Aufbau": getQty\("DPU Aufbau"\),\s*"Dispo": getQty\("Dispo"\),/;
const replace = `"KvHdF": getQty("KvHdF"),\n          "Dispo": getQty("Dispo"),`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
    console.log("Fixed export columns");
} else {
    console.log("Regex didn't match");
}
