const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany({
    where: { orderType: { contains: "BDE" } },
    include: { customer: true, services: { include: { serviceItem: true } } }
  });
  console.log(`Found ${orders.length} BDE orders.`);
  if (orders.length > 0) {
    console.log(orders[0].customer?.customerName);
  }
}
run();
