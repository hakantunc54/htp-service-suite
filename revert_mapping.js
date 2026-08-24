const fs = require('fs');

let actionsCode = fs.readFileSync('src/app/import/actions.ts', 'utf8');
actionsCode = actionsCode.replace(/"Anfahrt >12 km"/g, '"Anfahrt >12"');
actionsCode = actionsCode.replace(/"Anfahrt <12 km"/g, '"Anfahrt <12"');
fs.writeFileSync('src/app/import/actions.ts', actionsCode, 'utf8');

let pageCode = fs.readFileSync('src/app/import/page.tsx', 'utf8');
pageCode = pageCode.replace(/"Anfahrt >12 km"/g, '"Anfahrt >12"');
pageCode = pageCode.replace(/"Anfahrt <12 km"/g, '"Anfahrt <12"');
fs.writeFileSync('src/app/import/page.tsx', pageCode, 'utf8');
