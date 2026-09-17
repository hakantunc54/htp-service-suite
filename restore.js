const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const entrup = await prisma.customer.findFirst({ where: { customerName: { contains: 'Entrup' } } });
  const wackerbarth = await prisma.customer.findFirst({ where: { customerName: { contains: 'Wackerbarth' } } });

  if (entrup) {
    await prisma.order.create({
      data: {
        customerId: entrup.id,
        status: 'Abbruch',
        isBilled: true,
        orderValue: 20,
        kundenTerminStart: new Date('2026-09-02T07:30:00.000Z'), // 09:30 local
        orderType: 'FTTB',
        vehicle: 'Auto 2',
        services: {
          create: [
            {
              serviceItem: { connect: { name: 'Abbruch' } },
              quantity: 1,
              priceApplied: 20
            }
          ]
        }
      }
    });
    console.log("Restored Entrup");
  }

  if (wackerbarth) {
    await prisma.order.create({
      data: {
        customerId: wackerbarth.id,
        status: 'Abbruch',
        isBilled: true,
        orderValue: 20,
        kundenTerminStart: new Date('2026-09-02T10:00:00.000Z'), // Guessing time
        orderType: 'FTTB',
        vehicle: 'Auto 1',
        services: {
          create: [
            {
              serviceItem: { connect: { name: 'Abbruch' } },
              quantity: 1,
              priceApplied: 20
            }
          ]
        }
      }
    });
    console.log("Restored Wackerbarth");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
