const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const oldBlock = `<h3 className="text-sm font-bold text-gray-800 mb-3">Folgeauftrag (Klon)</h3>
              <button 
                onClick={handleCloneOrder} 
                disabled={isCloning}
                className="w-full text-left px-4 py-3 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl border border-orange-200 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Copy className="w-5 h-5" /> Auftrag klonen (für neuen Termin nach Abbruch)
              </button>`;

const newBlock = `<h3 className="text-sm font-bold text-gray-800 mb-3">Auftrag abgebrochen?</h3>
              <button 
                onClick={handleCloneOrder} 
                disabled={isCloning}
                className="w-full text-left px-4 py-3 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-xl border border-red-200 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Copy className="w-5 h-5" /> Abbruch & Neu klonen (für 2. Anfahrt)
              </button>`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
