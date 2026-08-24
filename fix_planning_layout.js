const fs = require('fs');
let code = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

const oldGrid = `<div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">`;
const newGrid = `<div className="flex-1 flex overflow-x-auto gap-6 min-h-0 pb-4">`;

code = code.replace(oldGrid, newGrid);

// Wrap the Unassigned block
code = code.replace(
  `<div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200">`,
  `<div className="w-[350px] flex-shrink-0 flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200">`
);

// Wrap the mapped vehicle block
code = code.replace(
  `<div key={vehicleName} className="flex flex-col h-full bg-blue-50/50 rounded-xl border border-blue-100">`,
  `<div key={vehicleName} className="w-[350px] flex-shrink-0 flex flex-col h-full bg-blue-50/50 rounded-xl border border-blue-100">`
);

fs.writeFileSync('src/app/planning/page.tsx', code, 'utf8');
