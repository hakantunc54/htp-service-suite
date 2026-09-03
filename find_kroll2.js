const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { customerName: { contains: "Kroll" } },
    include: { orders: true }
  });
  console.log(JSON.stringify(customer, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
