const fs = require('fs');

function isBdeLogic(varName) {
  return `((${varName}.orderType || '').toLowerCase().includes('bde') || (${varName}.orderType || '').toLowerCase().includes('endleitung') || ${varName}.vosNumber)`;
}

// 1. Fix planning/page.tsx
let planningCode = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

planningCode = planningCode.replace(
  /\(order\.orderType \|\| ''\)\.includes\('BdE'\)/g,
  isBdeLogic('order')
);

fs.writeFileSync('src/app/planning/page.tsx', planningCode, 'utf8');

// 2. Fix terminabsprachen/page.tsx
let terminCode = fs.readFileSync('src/app/terminabsprachen/page.tsx', 'utf8');
// In terminabsprachen, it's `(orders.find(o => o.id === activeOrder)?.orderType || "").includes("BdE")`
terminCode = terminCode.replace(
  /\(orders\.find\(o => o\.id === activeOrder\)\?\.orderType \|\| ""\)\.includes\("BdE"\)/g,
  `((orders.find(o => o.id === activeOrder)?.orderType || "").toLowerCase().includes("bde") || (orders.find(o => o.id === activeOrder)?.orderType || "").toLowerCase().includes("endleitung") || orders.find(o => o.id === activeOrder)?.vosNumber)`
);

fs.writeFileSync('src/app/terminabsprachen/page.tsx', terminCode, 'utf8');

