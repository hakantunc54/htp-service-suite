const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

const regex = /export async function saveBilling\(\s*orderId: string,\s*items: \{ serviceItemId: string; quantity: number; amount: number \}\[\],\s*totalAmount: number,\s*apartmentLocation: string = "",\s*technicianRemark: string = ""\s*\) \{/m;
const newSave = `export async function saveBilling(
  orderId: string, 
  items: { serviceItemId: string; quantity: number; amount: number }[],
  totalAmount: number,
  apartmentLocation: string = "",
  technicianRemark: string = "",
  bdeStatus?: string,
  materialDetails?: string
) {`;

code = code.replace(regex, newSave);
fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
console.log("Fixed saveBilling arguments");
