const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

const saveRegex = /export async function saveBilling\(\s*orderId: string,\s*items: \{ serviceItemId: string; quantity: number; amount: number \}\[\],\s*totalAmount: number,\s*apartmentLocation: string,\s*technicianRemark: string\s*\) \{/m;
const newSave = `export async function saveBilling(
  orderId: string, 
  items: { serviceItemId: string; quantity: number; amount: number }[],
  totalAmount: number,
  apartmentLocation: string,
  technicianRemark: string,
  bdeStatus?: string,
  materialDetails?: string
) {`;
code = code.replace(saveRegex, newSave);

const updateRegex = /orderValue: totalAmount\s*\}/m;
const newUpdate = `orderValue: totalAmount,
        ...(bdeStatus !== undefined && { bdeStatus }),
        ...(materialDetails !== undefined && { materialDetails })
      }`;
code = code.replace(updateRegex, newUpdate);

fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
console.log("Updated saveBilling in actions.ts");
