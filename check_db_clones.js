const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  orders.forEach(o => console.log(o.id, o.orderType, o.status, o.createdAt));
}
main().catch(console.error).finally(() => prisma.$disconnect());
