const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

// Update handleUpdateQuantity
const fnRegex = /const handleUpdateQuantity = \(itemId: string, defaultPrice: number \| null, change: number\) => \{\s*setEditedServices\(prev => \{\s*const existingIdx = prev\.findIndex\(s => s\.serviceItemId === itemId\);\s*let newServices = \[\.\.\.prev\];\s*if \(existingIdx >= 0\) \{\s*const item = newServices\[existingIdx\];\s*item\.quantity \+= change;\s*if \(item\.quantity <= 0\) \{\s*newServices\.splice\(existingIdx, 1\);\s*\}\s*\}\s*else\s*if\s*\(change > 0\)\s*\{\s*newServices\.push\(\{\s*id: `temp-\$\{Date\.now\(\)\}`,\s*orderId: order\.id,\s*serviceItemId: itemId,\s*quantity: change,\s*priceApplied: defaultPrice\s*\}\);\s*\}\s*return newServices;\s*\}\);\s*\};/m;

const newUpdateFn = `  const handleUpdateQuantity = (itemId: string, defaultPrice: number | null, change: number) => {
    setEditedServices(prev => {
      const existingIdx = prev.findIndex(s => s.serviceItemId === itemId);
      let newServices = [...prev];
      
      if (existingIdx >= 0) {
        const item = newServices[existingIdx];
        item.quantity = Math.round((item.quantity + change) * 100) / 100;
        if (item.quantity <= 0) {
          newServices.splice(existingIdx, 1);
        }
      } else if (change > 0) {
        newServices.push({
          id: \`temp-\${Date.now()}\`,
          orderId: order.id,
          serviceItemId: itemId,
          quantity: change,
          priceApplied: defaultPrice
        });
      }
      return newServices;
    });
  };`;

code = code.replace(fnRegex, newUpdateFn);

// Update buttons
const btnRegex = /<button\s*onClick=\{\(\) => handleUpdateQuantity\(item\.id, item\.defaultPrice, -1\)\}\s*className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30"\s*disabled=\{qty === 0\}\s*>\s*<Minus className="w-4 h-4" \/>\s*<\/button>\s*<span className="w-8 text-center font-bold text-slate-700">\{qty\}<\/span>\s*<button\s*onClick=\{\(\) => handleUpdateQuantity\(item\.id, item\.defaultPrice, 1\)\}\s*className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"\s*>\s*<Plus className="w-4 h-4" \/>\s*<\/button>/m;

const newButtons = `<button 
                        onClick={() => handleUpdateQuantity(item.id, item.defaultPrice, item.name.toLowerCase().includes("arbeitszeit") ? -0.25 : -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                        disabled={qty === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-700">{qty.toString().replace('.', ',')}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, item.defaultPrice, item.name.toLowerCase().includes("arbeitszeit") ? 0.25 : 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>`;

code = code.replace(btnRegex, newButtons);
fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');

console.log("Replaced fn:", fnRegex.test(fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8')) ? "No" : "Yes");
console.log("Replaced btn:", btnRegex.test(fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8')) ? "No" : "Yes");
