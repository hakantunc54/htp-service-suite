const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// Add the import for updateOrderDetailsText
code = code.replace('updateOrderServices } from "./actions";', 'updateOrderServices, updateOrderDetailsText } from "./actions";');

// Find where to insert WE-Lage and Bemerkung block
const oldBlock = `          {order.technicianRemark && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl mb-6">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Bemerkung</h3>
              <p className="text-slate-800 text-sm whitespace-pre-wrap">{order.technicianRemark}</p>
            </div>
          )}`;
          
const newBlock = `          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl mb-6 flex justify-between items-start">
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">WE-Lage / Wohnung</h3>
                <p className="text-slate-800 text-sm">{order.apartmentLocation || <span className="text-gray-400 italic">Nicht angegeben</span>}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Bemerkung</h3>
                <p className="text-slate-800 text-sm whitespace-pre-wrap">{order.technicianRemark || <span className="text-gray-400 italic">Keine Bemerkung</span>}</p>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const newLage = window.prompt("Neue WE-Lage / Wohnung:", order.apartmentLocation || "");
                if (newLage !== null) {
                  const newRemark = window.prompt("Neue Bemerkung:", order.technicianRemark || "");
                  if (newRemark !== null) {
                    await updateOrderDetailsText(order.id, newLage, newRemark);
                    toast.success("Details gespeichert");
                  }
                }
              }}
              className="text-amber-700 hover:text-amber-900 text-sm font-medium flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
            >
              <Settings2 className="w-3 h-3" /> Bearbeiten
            </button>
          </div>`;

code = code.replace(oldBlock, newBlock);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Updated order details UI");
