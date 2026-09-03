const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const startIdx = code.indexOf('{showManualSmsModal && (');
if (startIdx === -1) {
  console.log("Could not find start");
  process.exit(1);
}

const endIdx = code.indexOf('<EditServicesModal', startIdx);
if (endIdx === -1) {
  console.log("Could not find end");
  process.exit(1);
}

const newModal = `{showManualSmsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                SMS Senden
              </h2>
              <button onClick={() => setShowManualSmsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                Schlie\u00dfen
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Rufnummer (Google Messages)</label>
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <input 
                    type="text" 
                    readOnly 
                    className="bg-transparent font-mono text-gray-800 flex-1 outline-none" 
                    value={order?.customer.mobile || order?.customer.phone || 'Keine Nummer hinterlegt'} 
                    onFocus={e => e.target.select()}
                  />
                  <span className="text-xs text-gray-400">Strg+C</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Vorlage ausw\u00e4hlen</label>
                <div className="flex flex-col gap-2">
                  {[...templates].sort((a,b) => {
                    const orderList = ["Erstkontakt", "Erinnerung", "Letzte Erinnerung"];
                    const indexA = orderList.indexOf(a.name);
                    const indexB = orderList.indexOf(b.name);
                    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                  }).map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleSmsAction(t.name)}
                      className={\`text-left px-4 py-2.5 rounded-lg border transition-all \${selectedTemplateName === t.name ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}\`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {manualSmsText && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. SMS Text kopieren</label>
                  <textarea 
                    className="w-full h-32 p-3 border border-blue-200 bg-blue-50/30 rounded-xl outline-none font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                    value={manualSmsText}
                    readOnly
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                  <p className="text-xs text-gray-500 mt-2">Text anklicken und Strg+C dr\u00fccken.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowManualSmsModal(false)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
              >
                Abbrechen
              </button>
              <a 
                href="https://messages.google.com/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Google Messages \u00f6ffnen
              </a>
            </div>
          </div>
        </div>
      )}

      `;

code = code.substring(0, startIdx) + newModal + code.substring(endIdx);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Successfully replaced the modal UI");
