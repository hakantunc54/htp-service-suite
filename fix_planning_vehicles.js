const fs = require('fs');
let code = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

// The columns currently rendered are from `const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3];`
// We should render `['Auto 1', 'Auto 2', 'Auto 3', 'T1', 'T2', 'T3', 'T4']`!

const oldVehicles = `const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3];`;
const newVehicles = `const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3, 'T1', 'T2', 'T3', 'T4'];`;

code = code.replace(oldVehicles, newVehicles);

// Let's also update the filter logic for the Export.
const oldExport = `: orders.filter(o => [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3].includes(o.vehicle as any));`;
const newExport = `: orders.filter(o => vehicles.includes(o.vehicle as any));`;
code = code.replace(oldExport, newExport);

// Let's also update the "Auto zuweisen..." text in the selects to "Fahrzeug / Techniker zuweisen..."
code = code.replace(/Auto zuweisen.../g, 'Fahrzeug / Techniker zuweisen...');
code = code.replace(/Alle Autos/g, 'Alle Autos / Techniker');

// The grid layout has `xl:grid-cols-4` because 1 Pool + 3 Autos. Now we have 8 columns!
// Let's change it to a flex-nowrap with horizontal scroll, or just change grid-cols to 4 and they wrap.
// Right now it's `grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0`. If we have 8, it's better to make it scrollable horizontally!
const oldGrid = `<div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">`;
const newGrid = `<div className="flex-1 flex overflow-x-auto gap-6 min-h-0 pb-4">
          <div className="w-80 flex-shrink-0 flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200">
`;

// Wait, doing raw string replacement for a complex grid might be risky because I'm dropping the <div> around the pool.
// Actually, let's just use regex or AST.

