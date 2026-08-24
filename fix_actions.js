const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const oldLogic = `          if (targetName) {
            const si = serviceItems.find(i => i.name === targetName);
            if (si) {
              let priceToApply = 0;
              let qty = itemVal;

              if (targetName.toLowerCase().includes("optional") || targetName.toLowerCase().includes("material")) {
                 // Wenn es Variabel ist, ist die Menge = 1 und der Preis = der Wert aus der Excel
                 priceToApply = itemVal;
                 qty = 1;
              } else {
                 priceToApply = (si.defaultPrice || 0) * qty;
              }`;

const newLogic = `          if (targetName) {
            const si = serviceItems.find(i => i.name === targetName);
            if (si) {
              let priceToApply = 0;
              let qty = itemVal;

              const customPrice = (priceOverrides && priceOverrides[targetName] !== undefined) ? priceOverrides[targetName] : (si.defaultPrice || 0);

              if (targetName.toLowerCase().includes("optional") || targetName.toLowerCase().includes("material")) {
                 priceToApply = itemVal;
                 qty = 1;
              } else {
                 priceToApply = customPrice * qty;
              }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
