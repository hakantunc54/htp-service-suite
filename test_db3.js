const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const o = await prisma.order.findUnique({
    where: { id: "981e3304-d782-47d0-b120-e1a538706890" },
    include: { customer: true, services: { include: { serviceItem: true } } }
  });
  if (o) {
    console.log(`Order: ${o.id}, Customer: ${o.customer?.customerName}`);
    for (const s of o.services) {
      console.log(` - ${s.serviceItem.name}: qty=${s.quantity}, priceApplied=${s.priceApplied}`);
    }
  } else {
    console.log("Order not found!");
  }
}
run();
