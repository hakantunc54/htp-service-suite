const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.serviceItem.findMany({
    where: { name: { contains: 'Anfahrt' } }
  });
  items.forEach(i => console.log(i.name, '=>', i.defaultPrice));
}
main();
