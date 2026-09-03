const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const items = await prisma.orderServiceItem.findMany({
    include: {
      serviceItem: true,
      order: true
    },
    where: {
      serviceItem: {
        name: {
          contains: "Abbruch"
        }
      },
      quantity: { gt: 0 }
    }
  });

  let fixed = 0;
  for (const item of items) {
    if (item.order.status === "Erfolgreich abgeschlossen") {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { status: "Abbruch" }
      });
      fixed++;
      console.log(`Updated order ${item.orderId} to Abbruch`);
    }
  }
  
  console.log(`Done! Fixed ${fixed} orders.`);
}

run();
