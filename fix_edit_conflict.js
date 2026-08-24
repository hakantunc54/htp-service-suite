const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

const oldHasKeinZugang = `const hasKeinZugang = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "fZugang DPU/APL";
  });`;

const newHasKeinZugang = `const hasKeinZugang = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "fZugang DPU/APL";
  });
  
  const hasAbbruch = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "Abbruch";
  });`;

code = code.replace(oldHasKeinZugang, newHasKeinZugang);

code = code.replace(
  `const conflict = hasFttb && (hasKvhdf || hasKeinZugang);`,
  `const conflict = hasFttb && (hasKvhdf || hasKeinZugang || hasAbbruch);`
);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
