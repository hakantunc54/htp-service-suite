const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allBilledOrders = await prisma.order.findMany({
    where: { isBilled: true },
    select: { id: true, orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true, vehicle: true, customer: { select: { customerName: true } } }
  });
  
  let janFttbTotal = 0;
  let rawOrderValueSum = 0;
  let anfahrtSum = 0;
  
  const anfahrtGroups = {};
  
  const serviceItems = await prisma.serviceItem.findMany();
  const priceFttbLt12 = serviceItems.find(i => i.name.includes("<12"))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes(">12"))?.defaultPrice || 55;

  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (year === 2026 && month === 0) { // Jan 2026
      const val = o.orderValue || 0;
      const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      if (!isBDE) {
        janFttbTotal += val;
        rawOrderValueSum += val;
        
        const dateStr = date.toISOString().split('T')[0];
        const groupKey = `${dateStr}_${o.vehicle || 'Pool'}`;
        if (!anfahrtGroups[groupKey]) anfahrtGroups[groupKey] = 0;
        anfahrtGroups[groupKey] += 1;
      }
    }
  });

  Object.values(anfahrtGroups).forEach(count => {
    if (count > 0) {
      const anfahrtPreis = count >= 12 ? priceFttbGt12 : priceFttbLt12;
      janFttbTotal += anfahrtPreis;
      anfahrtSum += anfahrtPreis;
    }
  });

  console.log(`Jan 2026 Dashboard FTTB Total: ${janFttbTotal}`);
  console.log(`Raw Order Value Sum (FTTB): ${rawOrderValueSum}`);
  console.log(`Anfahrt Sum: ${anfahrtSum}`);
  console.log(`Number of Anfahrt Groups: ${Object.keys(anfahrtGroups).length}`);
  
  // Find orders with unusually high values
  const highValueOrders = allBilledOrders.filter(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    return date.getFullYear() === 2026 && date.getMonth() === 0 && !((o.orderType || "").toLowerCase().includes("bde") || o.vosNumber) && o.orderValue > 100;
  });
  console.log(`High value FTTB orders (>100): ${highValueOrders.length}`);
  if(highValueOrders.length > 0) {
      console.log(highValueOrders.slice(0,3).map(o => `${o.customer.customerName} - ${o.orderValue}`));
  }
}

run().catch(console.error);
