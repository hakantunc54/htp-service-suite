const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dt = new Date();
  dt.setHours(dt.getHours() - 1); // 1 hour ago
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: dt } }
  });
  console.log("Recent orders:", orders.length);
  orders.forEach(o => console.log(o.id, o.orderType, o.status, o.createdAt));
}
main().catch(console.error).finally(() => prisma.$disconnect());
