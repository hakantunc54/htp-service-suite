const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8');

const actionRegex = /export async function updateOrderServices\(orderId: string, servicesToSave: \{\s*serviceItemId: string,\s*quantity: number,\s*priceApplied: number\s*\}\[\]\) \{/m;
const newAction = `export async function updateOrderServices(orderId: string, servicesToSave: { serviceItemId: string, quantity: number, priceApplied: number }[], newRemark?: string) {`;
code = code.replace(actionRegex, newAction);

const updateRegex = /await tx\.order\.update\(\{\s*where: \{ id: orderId \},\s*data: \{ orderValue: newOrderValue \}\s*\}\);/m;
const newUpdate = `await tx.order.update({
      where: { id: orderId },
      data: { 
        orderValue: newOrderValue,
        ...(newRemark !== undefined && { technicianRemark: newRemark })
      }
    });`;
code = code.replace(updateRegex, newUpdate);

fs.writeFileSync('src/app/orders/[id]/actions.ts', code, 'utf8');
console.log("Updated actions.ts");
