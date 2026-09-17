const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany({
    include: { customer: true, services: { include: { serviceItem: true } } }
  });
  console.log(`Found ${orders.length} total orders.`);
  const w = orders.find(o => o.customer?.customerName.includes("Wömpner"));
  if (w) console.log("Found Wömpner!");
}
run();
