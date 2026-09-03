const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.serviceItem.findMany();
  console.log(items);
}

check().catch(e => console.error(e)).finally(() => prisma.$disconnect());
