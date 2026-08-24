const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.serviceItem.updateMany({
    where: { name: 'Anfahrt <12 km' },
    data: { name: 'Anfahrt <12' }
  });
  await prisma.serviceItem.updateMany({
    where: { name: 'Anfahrt >12 km' },
    data: { name: 'Anfahrt >12' }
  });
  console.log('Fixed DB items');
}
run();
