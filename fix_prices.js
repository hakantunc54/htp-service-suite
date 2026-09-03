const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.orderServiceItem.findMany({
    include: {
      serviceItem: true
    }
  });

  let fixedCount = 0;
  for (const item of items) {
    const isVariable = item.serviceItem.name.toLowerCase().includes("optional") || item.serviceItem.name.toLowerCase().includes("material");
    
    // If it's not a variable item, and the quantity is > 0, priceApplied MUST equal quantity * defaultPrice
    if (!isVariable && item.quantity > 0) {
      const expectedTotal = item.quantity * (item.serviceItem.defaultPrice || 0);
      
      // If priceApplied equals defaultPrice instead of quantity * defaultPrice, it was hit by the bug!
      if (item.priceApplied !== expectedTotal && item.priceApplied === item.serviceItem.defaultPrice && item.quantity > 1) {
        console.log(`Fixing OrderServiceItem ${item.id} (${item.serviceItem.name}): qty ${item.quantity}, priceApplied was ${item.priceApplied}, fixing to ${expectedTotal}`);
        
        await prisma.orderServiceItem.update({
          where: { id: item.id },
          data: { priceApplied: expectedTotal }
        });
        
        // Also update the total order value
        const allItemsInOrder = await prisma.orderServiceItem.findMany({ where: { orderId: item.orderId } });
        const newOrderTotal = allItemsInOrder.reduce((sum, i) => sum + (i.id === item.id ? expectedTotal : i.priceApplied), 0);
        
        await prisma.order.update({
          where: { id: item.orderId },
          data: { orderValue: newOrderTotal }
        });
        
        fixedCount++;
      }
    }
  }
  console.log(`Finished fixing ${fixedCount} corrupted service items.`);
}

run().catch(console.error);
