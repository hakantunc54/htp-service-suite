const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex1 = /<input \n\s*type="number" \n\s*min="0"\n\s*disabled=\{disabled\}\n\s*className=\{\`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm \$\{disabled \? 'bg-gray-100' : 'bg-gray-50'\}\`\}\n\s*value=\{q \|\| ""\}\n\s*placeholder="0"\n\s*onChange=\{e => setQuantities\(\{\.\.\.quantities, \[item\.id\]: parseInt\(e\.target\.value\) \|\| 0\}\)\}\n\s*\/>/;

const replace1 = `<input 
                              type="number" 
                              min="0"
                              step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}
                              disabled={disabled}
                              className={\`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm \${disabled ? 'bg-gray-100' : 'bg-gray-50'}\`}
                              value={q || ""}
                              placeholder="0"
                              onChange={e => setQuantities({...quantities, [item.id]: parseFloat(e.target.value.replace(',','.')) || 0})}
                            />`;

code = code.replace(regex1, replace1);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed decimals");
