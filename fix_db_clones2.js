const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.order.updateMany({
    where: {
      status: "Wartet auf HTP"
    },
    data: {
      status: "Neu"
    }
  });

  console.log("Updated clones:", updated.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
