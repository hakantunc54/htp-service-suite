const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.order.updateMany({
    where: {
      status: "Wartet auf HTP",
      orderType: { contains: "BDE" }
    },
    data: {
      status: "Neu"
    }
  });
  
  // also case insensitive check just in case
  const updated2 = await prisma.order.updateMany({
    where: {
      status: "Wartet auf HTP",
      orderType: { contains: "BdE" }
    },
    data: {
      status: "Neu"
    }
  });

  console.log("Updated clones:", updated.count + updated2.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
