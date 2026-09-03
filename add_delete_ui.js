const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  'import { getOrders, getServiceItems, saveBilling } from "./actions";',
  'import { getOrders, getServiceItems, saveBilling, deleteOrder } from "./actions";'
);
code = code.replace(
  'import { Users, Search, ChevronRight, Calculator, FileCheck2, Filter, X, CheckCircle2 } from "lucide-react";',
  'import { Users, Search, ChevronRight, Calculator, FileCheck2, Filter, X, CheckCircle2, Trash2 } from "lucide-react";'
);

// 2. Add handler inside the component
const targetHandler = 'const fetchData = async () => {';
const replaceHandler = `
  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (!confirm(\`Möchten Sie den Auftrag von \${customerName} wirklich unwiderruflich löschen?\`)) return;
    
    setLoading(true);
    const result = await deleteOrder(orderId);
    if (result.success) {
      toast.success("Auftrag erfolgreich gelöscht.");
      fetchData();
    } else {
      toast.error(result.error || "Fehler beim Löschen.");
      setLoading(false);
    }
  };

  const fetchData = async () => {`;
code = code.replace(targetHandler, replaceHandler);

// 3. Update the table cell
const targetUI = `<td className="px-6 py-4 text-right">
                        <Link 
                          href={\`/orders/\${order.id}\`}
                          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
                        >
                          Akte <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>`;
const replaceUI = `<td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={\`/orders/\${order.id}\`}
                            className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
                          >
                            Akte <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id, order.customer.customerName); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Auftrag löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>`;

if (code.includes(targetUI)) {
    code = code.replace(targetUI, replaceUI);
    fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
    console.log("Added delete UI");
} else {
    console.log("UI regex failed");
}
