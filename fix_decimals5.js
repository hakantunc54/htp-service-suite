const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const target = 'min="0"';
const replace = 'min="0"\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}';

// But there are two min="0"! We only want to replace the first one inside the non-variable block.
// Let's replace the one that is followed by `disabled={disabled}` where the class is `text-center`.

const specificTarget = 'min="0"\r\n                              disabled={disabled}\r\n                              className={`w-full text-center';
const specificReplace = 'min="0"\r\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}\r\n                              disabled={disabled}\r\n                              className={`w-full text-center';

const specificTarget2 = 'min="0"\n                              disabled={disabled}\n                              className={`w-full text-center';
const specificReplace2 = 'min="0"\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}\n                              disabled={disabled}\n                              className={`w-full text-center';

code = code.replace(specificTarget, specificReplace).replace(specificTarget2, specificReplace2);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed decimals 5");
