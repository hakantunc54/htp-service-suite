const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/actions.ts', 'utf8');

const newAction = `
export async function updateOrderDetailsText(orderId: string, apartmentLocation: string, technicianRemark: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { apartmentLocation, technicianRemark }
  });
  
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "SYSTEM",
      content: "Zusatzdetails (WE-Lage / Bemerkung) manuell in der Akte aktualisiert."
    }
  });

  revalidatePath(\`/orders/\${orderId}\`);
  revalidatePath('/orders');
  revalidatePath('/planning');
}
`;

code = code + newAction;
fs.writeFileSync('src/app/orders/[id]/actions.ts', code, 'utf8');
console.log("Added updateOrderDetailsText");
