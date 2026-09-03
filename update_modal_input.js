const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

// We will replace handleUpdateQuantity with handleSetQuantity
const updateFnStart = code.indexOf('const handleUpdateQuantity =');
const updateFnEnd = code.indexOf('const hasFttb =', updateFnStart);
const oldUpdateFn = code.substring(updateFnStart, updateFnEnd);

const newUpdateFn = `const handleSetQuantity = (itemId: string, defaultPrice: number | null, rawValue: string) => {
    // Erlaube leere Eingaben whrend des Tippens (werden als 0 gewertet)
    const val = rawValue.trim() === '' ? 0 : parseFloat(rawValue.replace(',', '.'));
    const qty = isNaN(val) ? 0 : val;

    setEditedServices(prev => {
      const existingIdx = prev.findIndex(s => s.serviceItemId === itemId);
      let newServices = [...prev];
      
      if (existingIdx >= 0) {
        if (qty <= 0) {
          newServices.splice(existingIdx, 1);
        } else {
          newServices[existingIdx].quantity = qty;
        }
      } else if (qty > 0) {
        newServices.push({
          id: \`temp-\${Date.now()}\`,
          orderId: order.id,
          serviceItemId: itemId,
          quantity: qty,
          priceApplied: defaultPrice
        });
      }
      return newServices;
    });
  };\n\n  `;

code = code.replace(oldUpdateFn, newUpdateFn);

// We will replace the <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1"> section with an input
const btnStart = code.indexOf('<div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">');
// Since there are multiple of these, we should replace it inside the map
code = code.replace(/<div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">[\s\S]*?<\/div>/g, 
`<div className="w-24">
                      <input 
                        type="number"
                        min="0"
                        step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.25" : "1"}
                        className="w-full text-right border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 outline-none text-sm bg-gray-50 border"
                        value={qty || ""}
                        placeholder="0"
                        onChange={(e) => handleSetQuantity(item.id, item.defaultPrice, e.target.value)}
                      />
                    </div>`);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Updated EditServicesModal.tsx with input fields");
