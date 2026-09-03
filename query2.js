const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { customer: true },
    orderBy: { kundenTerminStart: 'desc' },
    take: 10
  });
  orders.forEach(o => console.log(`${o.customer.customerName} - ${o.kundenTerminStart} - UI Date: ${new Date(o.kundenTerminStart).toLocaleDateString('de-DE')}`));
}
main().finally(() => prisma.$disconnect());
