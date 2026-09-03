const fs = require('fs');
let code = fs.readFileSync('src/app/billing/page.tsx', 'utf8');

// 1. Imports
code = code.replace(
  'import { FileSpreadsheet, Loader2, Calendar as CalendarIcon, Download } from "lucide-react";',
  'import { FileSpreadsheet, Loader2, Calendar as CalendarIcon, Download, Trash2 } from "lucide-react";\nimport { deleteOrder } from "../orders/actions";\nimport { toast } from "sonner";'
);

// 2. Handler
const handlerRegex = /const handleExport = async \(\) => \{/;
const newHandler = `
  const handleDeleteOrder = async (orderId: string, customerName: string) => {
    if (!confirm(\`Möchten Sie den abgerechneten Auftrag von \${customerName} wirklich unwiderruflich löschen?\`)) return;
    
    setLoading(true);
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        toast.success("Auftrag erfolgreich gelöscht.");
        await fetchBilledOrders(startDate, endDate);
      } else {
        toast.error(result.error || "Fehler beim Löschen.");
      }
    } catch (e) {
      toast.error("Fehler beim Löschen.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {`;
code = code.replace(handlerRegex, newHandler);

// 3. Table Header
code = code.replace(
  '<th className="px-6 py-4">Summe</th>',
  '<th className="px-6 py-4">Summe</th>\n                <th className="px-6 py-4 text-right">Aktionen</th>'
);

// 4. Table Cell
const cellRegex = /<td className="px-6 py-4 font-semibold text-slate-900">\s*\{\(order\.orderValue \|\| 0\)\.toFixed\(2\)\} €\s*<\/td>/;
const newCell = `<td className="px-6 py-4 font-semibold text-slate-900">
                    {(order.orderValue || 0).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteOrder(order.id, order.customer.customerName)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Auftrag löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>`;
code = code.replace(cellRegex, newCell);

fs.writeFileSync('src/app/billing/page.tsx', code, 'utf8');
console.log("Added delete to billing page");
