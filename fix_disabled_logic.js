const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const oldLogic = `if (hasFTTB && ["Abbruch", "KvHdF"].includes(itemName)) return true;
      if (hasAbbruch && ["FTTB", "PCI", "vLauiAPLe", "fZugang DPU/APL"].includes(itemName)) return true;`;

const newLogic = `if (hasFTTB && ["Abbruch", "KvHdF", "fZugang DPU/APL"].includes(itemName)) return true;
      if (hasAbbruch && ["FTTB", "PCI", "vLauiAPLe"].includes(itemName)) return true;`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
