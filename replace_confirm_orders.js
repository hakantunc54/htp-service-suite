const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. Add state
code = code.replace(
  'const [billingOrder, setBillingOrder] = useState<OrderData | null>(null);',
  'const [billingOrder, setBillingOrder] = useState<OrderData | null>(null);\n  const [orderToDelete, setOrderToDelete] = useState<{id: string, name: string} | null>(null);'
);

// 2. Replace handler
const oldHandlerRegex = /const handleDeleteOrder = async \(orderId: string, customerName: string\) => \{\s*if \(\!confirm\([\s\S]*?\}\s*\};/;
const newHandler = `const handleDeleteOrder = (orderId: string, customerName: string) => {
    setOrderToDelete({ id: orderId, name: customerName });
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setLoading(true);
    const result = await deleteOrder(orderToDelete.id);
    if (result.success) {
      toast.success("Auftrag erfolgreich gelöscht.");
      fetchData();
    } else {
      toast.error(result.error || "Fehler beim Löschen.");
      setLoading(false);
    }
    setOrderToDelete(null);
  };`;
code = code.replace(oldHandlerRegex, newHandler);

// 3. Add Modal UI at the end of the return
const modalUI = `
        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  Auftrag l\u00f6schen
                </h3>
                <button onClick={() => setOrderToDelete(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  M\u00f6chten Sie den Auftrag von <span className="font-semibold text-slate-800">{orderToDelete.name}</span> wirklich unwiderruflich l\u00f6schen?
                </p>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setOrderToDelete(null)}
                    className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button 
                    onClick={confirmDeleteOrder}
                    className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Unwiderruflich l\u00f6schen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
`;
code = code.replace(/<\/div>\s*\);\s*\}\s*$/, modalUI + '  }\n');

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Replaced native confirm in orders");
