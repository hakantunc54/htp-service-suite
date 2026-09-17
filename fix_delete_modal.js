const fs = require('fs');

let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const newCode = `      <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
        
        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Auftrag löschen</h3>
                <p className="text-gray-600 mb-6">Möchten Sie den Auftrag von <strong>{orderToDelete.name}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setOrderToDelete(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button 
                    onClick={confirmDeleteOrder}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Billing Modal */}`;

content = content.replace(
  /<div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">\s*\{\/\* Billing Modal \*\//,
  newCode
);

fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
console.log('Successfully injected Delete Modal!');
