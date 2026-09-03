const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. Add vehicle state
code = code.replace(
  'const [bdeStatus, setBdeStatus] = useState("BDE erledigt - neuer BT erforderlich");',
  'const [bdeStatus, setBdeStatus] = useState("BDE erledigt - neuer BT erforderlich");\n  const [vehicle, setVehicle] = useState("");'
);

// 2. Set vehicle on openBilling
code = code.replace(
  'setTechnicianRemark(order.technicianRemark || "");',
  'setTechnicianRemark(order.technicianRemark || "");\n    setVehicle(order.vehicle || "");'
);

// 3. Update saveBilling call
code = code.replace(
  'saveBilling(billingOrder.id, itemsToSave, totalAmount, apartmentLocation, technicianRemark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined);',
  'saveBilling(billingOrder.id, itemsToSave, totalAmount, apartmentLocation, technicianRemark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined, vehicle);'
);

// 4. Add UI in Modal
const uiTarget = `<div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WE-Lage</label>`;
const uiReplace = `<div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fahrzeug / Techniker</label>
                    <select 
                      value={vehicle}
                      onChange={e => setVehicle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm bg-white"
                    >
                      <option value="">Nicht zugewiesen</option>
                      <option value="Auto 1">Auto 1</option>
                      <option value="Auto 2">Auto 2</option>
                      <option value="Auto 3">Auto 3</option>
                      <option value="T 1">T 1 (BDE)</option>
                      <option value="T 2">T 2 (BDE)</option>
                      <option value="T 3">T 3 (BDE)</option>
                      <option value="T 4">T 4 (BDE)</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WE-Lage</label>`;
code = code.replace(uiTarget, uiReplace);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Updated page.tsx");
