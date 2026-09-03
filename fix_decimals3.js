const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

code = code.replace(
  'onChange={e => setQuantities({...quantities, [item.id]: parseInt(e.target.value) || 0})}',
  'onChange={e => setQuantities({...quantities, [item.id]: parseFloat(e.target.value.replace(",", ".")) || 0})}'
);

code = code.replace(
  'type="number" \n                              min="0"\n                              disabled={disabled}\n                              className={`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm ${disabled ? \'bg-gray-100\' : \'bg-gray-50\'}`}',
  'type="number" \n                              min="0"\n                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}\n                              disabled={disabled}\n                              className={`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm ${disabled ? \'bg-gray-100\' : \'bg-gray-50\'}`}'
);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed decimals 3");
