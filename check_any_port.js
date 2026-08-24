const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.order.count({
    where: { port: { not: "" } }
  });
  console.log("Orders with a port:", count);
  if (count > 0) {
    const orders = await prisma.order.findMany({
      where: { port: { not: "" } },
      select: { port: true },
      take: 5
    });
    console.log(orders);
  }
}
main();
