const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.orderServiceItem.findMany({
    where: { quantity: { gt: 1 } },
    include: { serviceItem: true, order: { include: { customer: true } } }
  });
  console.log("Items with qty > 1:");
  for (const i of items) {
    console.log(`${i.order.customer?.customerName} - ${i.serviceItem.name}: qty=${i.quantity}, priceApplied=${i.priceApplied}, defaultPrice=${i.serviceItem.defaultPrice}`);
  }
}
run();
