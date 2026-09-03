const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

code = code.replace(
  '"KvHdF": getQty("KvHdF"),',
  '"KvHdF": getQty("KvHdF"),\n            "DPU Aufbau": getQty("DPU Aufbau"),'
);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
console.log("Added DPU Aufbau to export");
