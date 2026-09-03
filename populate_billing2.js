const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /const openBilling = \(order: OrderData\) => \{[\s\S]*?setMaterialDetails[\s\S]*?\};/m;

const newOpen = `  const openBilling = (order: OrderData) => {
    setBillingOrder(order);
    
    const newQuantities: Record<string, number> = {};
    const newVariables: Record<string, number> = {};
    
    if (order.services && order.services.length > 0) {
      order.services.forEach(s => {
        const si = serviceItems.find(item => item.id === s.serviceItemId);
        if (si && (si.name.toLowerCase().includes("optional") || si.name.toLowerCase().includes("material"))) {
          newVariables[s.serviceItemId] = Number(s.priceApplied || 0);
        } else {
          newQuantities[s.serviceItemId] = Number(s.quantity);
        }
      });
    }
    
    setQuantities(newQuantities);
    setVariableValues(newVariables);
    
    setApartmentLocation(order.apartmentLocation || "");
    setTechnicianRemark(order.technicianRemark || "");
    setVehicle(order.vehicle || "");
    setBdeStatus(order.bdeStatus || "BDE erledigt - neuer BT erforderlich");
    setMaterialDetails(order.materialDetails || "Zeitaufwand: 1 Techniker 2,00 Std.\\nMaterialaufwand: \\n- 10m ISTY (15,00 EUR)\\n- 5m Verlegematerial (7,50 EUR)\\n- 1 x TAE Dose AP (15 EUR)");
  };`;

code = code.replace(regex, newOpen);
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed openBilling 2");
