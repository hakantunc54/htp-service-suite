const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { customerNumber: "4514346000" },
    include: { orders: true }
  });
  console.log(customer);
}
main().catch(console.error).finally(() => prisma.$disconnect());
