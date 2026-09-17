const fs = require('fs');

// 1. Add 'Storno HTP' button to Quick Actions in src/app/orders/[id]/page.tsx
let orderDetails = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const newButton = `<button onClick={() => handleQuickAction("Storno HTP")} className="text-left px-4 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 font-medium mt-4 flex items-center gap-2">
                    <X className="w-4 h-4" /> Als "Storno HTP" markieren
                  </button>
                </div>
              </>`;

orderDetails = orderDetails.replace(/<\/div>\s*<\/>\s*\)\}/m, newButton + '\n            )}');

// We must also make sure `X` is imported from lucide-react if not already
if (!orderDetails.includes('X,')) {
    orderDetails = orderDetails.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { X, $1 } from "lucide-react";');
}

fs.writeFileSync('src/app/orders/[id]/page.tsx', orderDetails, 'utf8');


// 2. Hide "Abrechnen" button and add styling for "Storno HTP" in src/app/orders/page.tsx
let ordersList = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// A. Fix the status pill color
ordersList = ordersList.replace(
  /order\.status === "Storniert" \|\| order\.status === "Abbruch" \? "bg-red-100 text-red-800" :/,
  'order.status === "Storniert" || order.status === "Storno HTP" || order.status === "Abbruch" ? "bg-red-100 text-red-800" :'
);

// B. Hide the "Abrechnen" button if Storno
const billingTd = `{order.isBilled ? (
                          <button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>
                        ) : (
                          <button
                            onClick={() => openBilling(order)}
                            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-3 rounded-lg border border-amber-200 transition-colors shadow-sm"
                          >
                            Abrechnen
                          </button>
                        )}`;

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

ordersList = ordersList.replace(billingTd, newBillingTd);
fs.writeFileSync('src/app/orders/page.tsx', ordersList, 'utf8');

console.log("Storno HTP feature added.");
