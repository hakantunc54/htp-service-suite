const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const billedData = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: true }
  });
  console.log("Current DB Revenue on Localhost:", billedData._sum.orderValue);
  const count = await prisma.order.count();
  console.log("Current DB Orders:", count);
}
run();
