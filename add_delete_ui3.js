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

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Added imports and handler");
