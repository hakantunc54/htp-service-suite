const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const sum = await prisma.order.aggregate({ _sum: { orderValue: true }, where: { isBilled: true } });
  console.log("DB Sum:", sum._sum.orderValue);

  const orders = await prisma.orderServiceItem.findMany({
    include: { serviceItem: true }
  });
  
  let sums = {};
  for(const osi of orders) {
    if(!sums[osi.serviceItem.name]) sums[osi.serviceItem.name] = { count: 0, revenue: 0, samplePriceApplied: osi.priceApplied };
    sums[osi.serviceItem.name].count += osi.quantity;
    sums[osi.serviceItem.name].revenue += osi.priceApplied;
  }
  
  console.log(sums);
}
run();
