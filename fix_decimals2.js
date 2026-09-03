const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const searchCode = `<input 
                              type="number" 
                              min="0"
                              disabled={disabled}
                              className={\`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm \${disabled ? 'bg-gray-100' : 'bg-gray-50'}\`}
                              value={q || ""}
                              placeholder="0"
                              onChange={e => setQuantities({...quantities, [item.id]: parseInt(e.target.value) || 0})}
                            />`;

const replaceCode = `<input 
                              type="number" 
                              min="0"
                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}
                              disabled={disabled}
                              className={\`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm \${disabled ? 'bg-gray-100' : 'bg-gray-50'}\`}
                              value={q || ""}
                              placeholder="0"
                              onChange={e => setQuantities({...quantities, [item.id]: parseFloat(e.target.value) || 0})}
                            />`;

code = code.replace(searchCode, replaceCode);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed decimals 2");
