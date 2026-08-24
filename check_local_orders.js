const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.order.count();
  const sum = await prisma.order.aggregate({ _sum: { orderValue: true }, where: { isBilled: true } });
  console.log("Orders:", count);
  console.log("Sum:", sum._sum.orderValue);
  
  if (count > 0) {
    const randomOrder = await prisma.order.findFirst({
      include: { serviceItems: { include: { serviceItem: true } } }
    });
    console.log("Sample Order:", JSON.stringify(randomOrder, null, 2));
  }
}
run();
