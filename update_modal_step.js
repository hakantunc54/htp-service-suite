const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

code = code.replace(
  'step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.25" : "1"}', 
  'step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}'
);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Updated step to 0.01");
