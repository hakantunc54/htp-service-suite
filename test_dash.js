const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allBilledOrders = await prisma.order.findMany({
    where: { isBilled: true },
    include: { services: { include: { serviceItem: true } } }
  });

  let janBdeTotal = 0;
  
  for (const o of allBilledOrders) {
    const date = o.kundenTerminStart || o.updatedAt;
    const m = date.getMonth(); // 0 = Jan
    if (m === 0) {
      const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      if (isBDE) {
        let val = 0;
        o.services.forEach(s => {
          if (!s.serviceItem.name.toLowerCase().includes('anfahrt')) {
            val += s.priceApplied || 0;
          }
        });
        if (val > 0) {
          console.log(`Jan BDE Order ${o.id} - ${val} EUR`);
          janBdeTotal += val;
        }
      }
    }
  }
  console.log("Total Jan BDE (Base):", janBdeTotal);
}
run();
