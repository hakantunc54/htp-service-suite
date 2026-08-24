const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

code = code.replace(
  `const category = isBDE ? "BdE" : "FTTB";`,
  `const category = isBDE ? "BDE" : "FTTB";`
);

// I will also make sure we sort them exactly like the main BillingModal so the order is nice!
// Let's add the sorting logic!
const oldReturn = `return availableItems
                  .filter(item => item.category === category)
                  .filter(item => !item.name.toLowerCase().includes("anfahrt"));
              })().map(item => {`;

const newReturn = `const bdeOrder = ["Arbeitszeit (Std.)", "Material (BDE)", "Optional (BDE)"];
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
            })().map(item => {`;

code = code.replace(oldReturn, newReturn);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
