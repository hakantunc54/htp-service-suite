const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

const oldFilter = `{availableItems.filter(item => item.category === 'ALL' || orderType.includes(item.category)).map(item => {`;

const newFilter = `
            {(() => {
              const isBDE = (orderType || "").toLowerCase().includes("bde") || (orderType || "").toLowerCase().includes("endleitung");
              const category = isBDE ? "BdE" : "FTTB";
              return availableItems
                .filter(item => item.category === category)
                .filter(item => !item.name.toLowerCase().includes("anfahrt"));
            })().map(item => {`;

code = code.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
