const fs = require('fs');

let ordersList = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /\{order\.isBilled \? \([\s\S]*?<\/button>\s*\)\}/;

const newBillingTd = `{order.status === "Storno HTP" || order.status === "Storniert" ? (
                          <span className="text-red-500 font-bold flex items-center gap-1 text-sm bg-red-50 px-2 py-1 rounded-md w-fit"><X className="w-4 h-4" /> STORNO</span>
                        ) : order.isBilled ? (
                          <button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>
                        ) : (
                          <button
                            onClick={() => openBilling(order)}
                            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-3 rounded-lg border border-amber-200 transition-colors shadow-sm"
                          >
                            Abrechnen
                          </button>
                        )}`;

ordersList = ordersList.replace(regex, newBillingTd);
fs.writeFileSync('src/app/orders/page.tsx', ordersList, 'utf8');

console.log("Storno HTP button UI fixed.");
