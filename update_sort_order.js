const fs = require('fs');

// orders/page.tsx
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');
code = code.replace(
  '"Optional / Material (FTTB)"',
  '"DPU Aufbau",\n        "Optional / Material (FTTB)"'
);
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');

// EditServicesModal.tsx
let code2 = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');
code2 = code2.replace(
  '"Optional / Material (FTTB)"',
  '"DPU Aufbau", "Optional / Material (FTTB)"'
);
fs.writeFileSync('src/components/EditServicesModal.tsx', code2, 'utf8');

console.log("Updated sort order");
