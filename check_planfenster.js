const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    where: { htpPlanfenster: { not: null } },
    select: { htpPlanfenster: true },
    take: 5
  });
  console.log(orders);
}
main();
