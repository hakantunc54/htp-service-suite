const fs = require('fs');
let code = fs.readFileSync('src/app/orders/actions.ts', 'utf8');

const newAction = `
export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    revalidatePath("/orders");
    revalidatePath("/billing");
    return { success: true };
  } catch (error) {
    console.error("Fehler beim Löschen des Auftrags:", error);
    return { success: false, error: "Auftrag konnte nicht gelöscht werden" };
  }
}
`;

if (!code.includes('deleteOrder(orderId')) {
    code += newAction;
    fs.writeFileSync('src/app/orders/actions.ts', code, 'utf8');
    console.log("Added deleteOrder action");
} else {
    console.log("Action already exists");
}
