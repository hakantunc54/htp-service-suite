const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// handleSaveServices definition
const handleSaveFnRegex = /const handleSaveServices = async \(newServices: any\[\], newRemark\?: string\) => \{/m;
const newHandleSaveFn = `const handleSaveServices = async (newServices: any[], newRemark?: string, newBdeStatus?: string, newMaterialDetails?: string) => {`;
code = code.replace(handleSaveFnRegex, newHandleSaveFn);

// handleSaveServices call to updateOrderServices
const callRegex = /const res = await updateOrderServices\(order\.id, newServices, newRemark\);/m;
const newCall = `const res = await updateOrderServices(order.id, newServices, newRemark, newBdeStatus, newMaterialDetails);`;
code = code.replace(callRegex, newCall);

// EditServicesModal props
const modalRegex = /currentRemark=\{order\.technicianRemark \|\| ""\}\s*\/>/m;
const newModal = `currentRemark={order.technicianRemark || ""}
        currentBdeStatus={order.bdeStatus || ""}
        currentMaterialDetails={order.materialDetails || ""}
      />`;
code = code.replace(modalRegex, newModal);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Updated page.tsx");
