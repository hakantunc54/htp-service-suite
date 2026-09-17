const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany({
    where: { customer: { customerName: { contains: "Wömpner" } } },
    include: { customer: true, services: { include: { serviceItem: true } } }
  });
  console.log(`Found ${orders.length} orders for Wömpner`);
  for (const o of orders) {
    console.log(`Order: ${o.id}`);
    for (const s of o.services) {
      console.log(` - ${s.serviceItem.name}: qty=${s.quantity}, priceApplied=${s.priceApplied}`);
    }
  }
}
run();
