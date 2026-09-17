const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace(
  /const priceBde = serviceItems\.find\(i => i\.name\.includes\("BdE"\) && i\.name\.includes\("Anfahrt"\)\)\?\.defaultPrice \|\| 38;/g,
  'const priceBde = serviceItems.find(i => i.name.toLowerCase().includes("bde") && i.name.toLowerCase().includes("anfahrt"))?.defaultPrice || 60;'
);
fs.writeFileSync('src/app/page.tsx', content, 'utf8');

let content2 = fs.readFileSync('src/app/api/debug-revenue/route.ts', 'utf8');
content2 = content2.replace(
  /const priceBde = serviceItems\.find\(i => i\.name\.includes\("BdE"\) && i\.name\.includes\("Anfahrt"\)\)\?\.defaultPrice \|\| 38;/g,
  'const priceBde = serviceItems.find(i => i.name.toLowerCase().includes("bde") && i.name.toLowerCase().includes("anfahrt"))?.defaultPrice || 60;'
);
fs.writeFileSync('src/app/api/debug-revenue/route.ts', content2, 'utf8');

console.log("Fixed Anfahrt BDE price lookup.");
