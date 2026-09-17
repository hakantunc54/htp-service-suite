const fs = require('fs');
let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /\{dateFilter && \([\s\S]*?<\/button>\s*\)\}/;

const newButton = `{(dateFilter || search) && (
                  <button 
                    onClick={() => { setDateFilter(""); setSearch(""); }}
                    className="text-xs text-red-500 hover:underline whitespace-nowrap bg-red-50 px-2 py-1 rounded-md ml-2 font-medium"
                  >
                    Filter & Suche l\u00f6schen
                  </button>
                )}`;

content = content.replace(regex, newButton);
fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
console.log("Filter button fixed with regex.");
