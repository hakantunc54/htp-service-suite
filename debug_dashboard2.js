const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allBilledOrders = await prisma.order.findMany({
    where: { isBilled: true },
    select: { id: true, orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true, vehicle: true, customer: { select: { customerName: true } } }
  });
  
  console.log(`Total billed orders: ${allBilledOrders.length}`);
  
  const byMonth = {};
  allBilledOrders.forEach(o => {
      const date = o.kundenTerminStart || o.updatedAt;
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      if(!byMonth[key]) byMonth[key] = { FTTB: 0, BDE: 0, count: 0 };
      
      const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      byMonth[key][isBDE ? 'BDE' : 'FTTB'] += (o.orderValue || 0);
      byMonth[key].count++;
  });
  
  console.log(byMonth);
}
run();
