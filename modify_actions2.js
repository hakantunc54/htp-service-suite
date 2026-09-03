const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8');

const actionRegex = /export async function updateOrderServices\(orderId: string, servicesToSave: \{ serviceItemId: string, quantity: number, priceApplied: number \}\[\], newRemark\?: string\) \{/m;
const newAction = `export async function updateOrderServices(orderId: string, servicesToSave: { serviceItemId: string, quantity: number, priceApplied: number }[], newRemark?: string, newBdeStatus?: string, newMaterialDetails?: string) {`;
code = code.replace(actionRegex, newAction);

const updateRegex = /\.\.\.\(newRemark \!== undefined && \{ technicianRemark: newRemark \}\)/m;
const newUpdate = `...(newRemark !== undefined && { technicianRemark: newRemark }),
        ...(newBdeStatus !== undefined && { bdeStatus: newBdeStatus }),
        ...(newMaterialDetails !== undefined && { materialDetails: newMaterialDetails })`;
code = code.replace(updateRegex, newUpdate);

fs.writeFileSync('src/app/orders/[id]/actions.ts', code, 'utf8');
console.log("Updated actions.ts");
