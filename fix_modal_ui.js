const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const regex = /<EditServicesModal/m;

const newUi = `{showManualSmsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Manuelles Kopieren nötig
              </h2>
              <button onClick={() => setShowManualSmsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                ?
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Da du über eine lokale IP-Adresse zugreifst, blockiert der Browser das automatische Kopieren. 
                Bitte markiere den Text unten (oder drücke <strong>Strg + A</strong> und <strong>Strg + C</strong>) und öffne dann Google Messages.
              </p>
              <textarea 
                className="w-full h-48 p-4 border border-blue-200 bg-blue-50/30 rounded-xl outline-none font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                value={manualSmsText}
                readOnly
                autoFocus
                onFocus={(e) => e.target.select()}
              />
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
                onClick={() => setShowManualSmsModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Google Messages öffnen
              </a>
            </div>
          </div>
        </div>
      )}

      <EditServicesModal`;
      
code = code.replace(regex, newUi);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Injected the manual SMS modal UI");
