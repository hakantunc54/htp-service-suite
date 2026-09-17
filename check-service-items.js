const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const items = await prisma.serviceItem.findMany({ where: { name: { contains: "Anfahrt" } } });
  for (const i of items) {
    console.log(`- ${i.name}: ${i.defaultPrice}`);
  }
}
run();
