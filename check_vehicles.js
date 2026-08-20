const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany({ 
    where: { isBilled: true }, 
    select: { id: true, vehicle: true, orderType: true } 
  }); 
  console.log(orders);
}

run().finally(() => prisma.$disconnect());
