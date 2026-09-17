const fs = require('fs');
let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const oldButton = `{dateFilter && (
                  <button 
                    onClick={() => setDateFilter("")}
                    className="text-xs text-red-500 hover:underline whitespace-nowrap"
                  >
                    Filter lschen
                  </button>
                )}`;

const newButton = `{(dateFilter || search) && (
                  <button 
                    onClick={() => { setDateFilter(""); setSearch(""); }}
                    className="text-xs text-red-500 hover:underline whitespace-nowrap bg-red-50 px-2 py-1 rounded-md ml-2 font-medium"
                  >
                    Filter & Suche lschen
                  </button>
                )}`;

content = content.replace(oldButton, newButton);
fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
console.log("Filter button fixed.");
