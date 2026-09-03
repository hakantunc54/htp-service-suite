const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const regex = /<button onClick=\{\(\) => setShowManualSmsModal\(false\)\} className="text-gray-400 hover:text-gray-600 transition-colors">[\s\S]*?<\/button>/m;
const newBtn = `<button onClick={() => setShowManualSmsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                Schlieﬂen
              </button>`;

code = code.replace(regex, newBtn);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Fixed X button");
