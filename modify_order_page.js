const fs = require('fs');
const path = 'src/app/orders/[id]/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const importsToAdd = "import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder } from './actions';\nimport { Copy } from 'lucide-react';\nimport { useRouter } from 'next/navigation';";
code = code.replace("import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus } from './actions';", importsToAdd);

// Add router
code = code.replace("const [note, setNote] = useState(\"\");", "const [note, setNote] = useState(\"\");\n  const router = useRouter();\n  const [isCloning, setIsCloning] = useState(false);");

// Add clone handler
const cloneHandler = `
  const handleCloneOrder = async () => {
    if (!order) return;
    const confirm = window.confirm("M\u00f6chtest du diesen Auftrag abschlie\u00dfen und einen Klon f\u00fcr HTP erstellen?");
    if (!confirm) return;
    
    setIsCloning(true);
    try {
      await updateOrderStatus(order.id, "Erfolgreich abgeschlossen", order.communicationStatus);
      const res = await cloneOrder(order.id);
      if (res.success) {
        toast.success("Folgeauftrag (Klon) erfolgreich erstellt!");
        router.push(\`/orders/\${res.newOrderId}\`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim Erstellen des Klon-Auftrags");
      setIsCloning(false);
    }
  };

  const handleQuickAction = async (status: string, commStatus?: string) => {
`;
code = code.replace("  const handleQuickAction = async (status: string, commStatus?: string) => {", cloneHandler);

const cloneButton = `
          <h3 className="text-sm font-bold text-gray-800 mb-3">Status Updates (Quick Actions)</h3>
          <div className="flex flex-col gap-2 mb-8">
            <button onClick={() => handleQuickAction(OrderStatus.KUNDE_ERREICHT, CommunicationStatus.ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
              \ud83d\udce2 Kunde erreicht
            </button>
            <button onClick={() => handleQuickAction(OrderStatus.KUNDE_NICHT_ERREICHT, CommunicationStatus.NICHT_ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
              \ud83d\udce2 Kunde nicht erreicht
            </button>
            
            <button 
              onClick={handleCloneOrder} 
              disabled={isCloning}
              className="text-left px-4 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg border border-orange-200 mt-4 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Copy className="w-4 h-4" /> BDE Abbrechen & Folgeauftrag (Klon) erstellen
            </button>
          </div>
`;

// use string replacement to safely inject the button
// find the block with "Status Updates"
code = code.replace(/<h3 className="text-sm font-bold text-gray-800 mb-3">Status Updates \(Quick Actions\).*?<\/div>/s, cloneButton);

fs.writeFileSync(path, code, 'utf8');
