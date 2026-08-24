const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    where: { status: "Neu" },
    select: { customer: { select: { customerName: true } }, port: true, orderType: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log(orders);
}
main();
