const fs = require('fs');

let actionsCode = fs.readFileSync('src/app/import/actions.ts', 'utf8');
actionsCode = actionsCode.replace(/"Anfahrt\\n<12": "Anfahrt <12"/g, '"Anfahrt\\n<12": "Anfahrt <12 km"');
actionsCode = actionsCode.replace(/"Anfahrt\\r\\n<12": "Anfahrt <12"/g, '"Anfahrt\\r\\n<12": "Anfahrt <12 km"');
actionsCode = actionsCode.replace(/"Anfahrt <12": "Anfahrt <12"/g, '"Anfahrt <12": "Anfahrt <12 km"');
actionsCode = actionsCode.replace(/"Anfahrt >12": "Anfahrt >12"/g, '"Anfahrt >12": "Anfahrt >12 km"');
fs.writeFileSync('src/app/import/actions.ts', actionsCode, 'utf8');

let pageCode = fs.readFileSync('src/app/import/page.tsx', 'utf8');
pageCode = pageCode.replace(/"Anfahrt\\n<12": "Anfahrt <12"/g, '"Anfahrt\\n<12": "Anfahrt <12 km"');
pageCode = pageCode.replace(/"Anfahrt\\r\\n<12": "Anfahrt <12"/g, '"Anfahrt\\r\\n<12": "Anfahrt <12 km"');
pageCode = pageCode.replace(/"Anfahrt <12": "Anfahrt <12"/g, '"Anfahrt <12": "Anfahrt <12 km"');
pageCode = pageCode.replace(/"Anfahrt >12": "Anfahrt >12"/g, '"Anfahrt >12": "Anfahrt >12 km"');
fs.writeFileSync('src/app/import/page.tsx', pageCode, 'utf8');
