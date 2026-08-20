const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.serviceItem.deleteMany({
    where: { name: 'Anfahrt', category: 'BDE' }
  });
  console.log("Removed Anfahrt from BDE");
}

run().finally(() => prisma.$disconnect());
