const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

code = code.replace(/const category = isBDE \? "BdE" : "FTTB";/g, 'const category = isBDE ? "BDE" : "FTTB";');

const match = code.match(/return availableItems\s*\.filter\(item => item\.category === category\)\s*\.filter\(item => !item\.name\.toLowerCase\(\)\.includes\("anfahrt"\)\);/);

if (match) {
  const newReturn = `
              const bdeOrder = ["Arbeitszeit (Std.)", "Material (BDE)", "Optional (BDE)"];
              const fttbOrder = ["FTTB", "Abbruch", "MAW (5Min)", "PCI", "vLauiAPLe", "Warten 5Min", "Warten 10Min", "fZugang DPU/APL", "KvHdF", "Dispo", "Optional / Material (FTTB)"];
              const sortOrder = isBDE ? bdeOrder : fttbOrder;
              
              return availableItems
                .filter(item => item.category === category)
                .filter(item => !item.name.toLowerCase().includes("anfahrt"))
                .sort((a, b) => {
                  const indexA = sortOrder.indexOf(a.name);
                  const indexB = sortOrder.indexOf(b.name);
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });
  `;
  code = code.replace(match[0], newReturn);
  fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Match failed!");
}
