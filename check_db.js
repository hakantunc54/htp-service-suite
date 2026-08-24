const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.serviceItem.findMany();
  items.forEach(i => console.log(i.name, '=>', i.category));
}
main();
