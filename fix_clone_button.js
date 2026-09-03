const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const oldBlock = `                {(order.orderType || "").includes("BdE") && (
                  <button 
                    onClick={handleCloneOrder} 
                    disabled={isCloning}
                    className="text-left px-4 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg border border-orange-200 mt-4 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> BDE Abbrechen & Folgeauftrag (Klon) erstellen
                  </button>
                )}
              </div>
            </>
          )}`;

const newBlock = `              </div>
            </>
          )}

          {/* Der Klon-Button für BDEs ist immer sichtbar, auch wenn abgerechnet wurde */}
          {(order.orderType || "").toLowerCase().includes("bde") && (
            <div className="mt-6 mb-8">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Folgeauftrag (Klon)</h3>
              <button 
                onClick={handleCloneOrder} 
                disabled={isCloning}
                className="w-full text-left px-4 py-3 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl border border-orange-200 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Copy className="w-5 h-5" /> Auftrag klonen (für neuen Termin nach Abbruch)
              </button>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Erstellt eine exakte Kopie dieses Auftrags in der Disposition (ohne die bisher abgerechneten Leistungen), um einen neuen Termin zu vereinbaren.
              </p>
            </div>
          )}`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
