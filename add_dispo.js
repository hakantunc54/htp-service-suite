const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.serviceItem.upsert({
    where: { name: 'Dispo' },
    update: { defaultPrice: 0, category: 'FTTB' },
    create: { name: 'Dispo', defaultPrice: 0, category: 'FTTB' }
  });
  console.log("Added Dispo");
}

run().finally(() => prisma.$disconnect());
