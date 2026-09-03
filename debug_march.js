const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const month = 2; // March (0-indexed)
  const year = 2026;
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      isBilled: true,
      OR: [
        { kundenTerminStart: { gte: startDate, lte: endDate } },
        { updatedAt: { gte: startDate, lte: endDate }, kundenTerminStart: null }
      ]
    },
    include: {
      customer: true,
      services: {
        include: { serviceItem: true }
      }
    }
  });

  const serviceItems = await prisma.serviceItem.findMany();
  const priceFttbLt12 = serviceItems.find(i => i.name.includes('<12'))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes('>12'))?.defaultPrice || 55;
  
  let dashboardBase = 0;
  let dashboardAnfahrt = 0;
  const anfahrtGroups = {};
  
  orders.forEach(o => {
    const isBDE = (o.orderType || '').toLowerCase().includes('bde') || (o.orderType || '').toLowerCase().includes('endleitung') || o.vosNumber;
    if (isBDE) return;

    let val = 0;
    if (o.services && o.services.length > 0) {
      o.services.forEach(s => {
        if (!s.serviceItem.name.toLowerCase().includes('anfahrt')) val += s.priceApplied || 0;
      });
    }
    dashboardBase += val;

    const date = o.kundenTerminStart || o.updatedAt;
    const dateStr = date.toISOString().split('T')[0];
    const groupKey = `${dateStr}_${o.vehicle || 'Pool'}`;
    
    anfahrtGroups[groupKey] = (anfahrtGroups[groupKey] || 0) + 1;
  });

  Object.values(anfahrtGroups).forEach(count => {
    if (count > 0) dashboardAnfahrt += count >= 12 ? priceFttbGt12 : priceFttbLt12;
  });

  let exportBase = 0;
  let exportAnfahrt = 0;
  const exportAnfahrtGroups = {};
  
  const fttbOrders = orders.filter(o => o.orderType && !o.orderType.toLowerCase().includes('bde') && !o.orderType.toLowerCase().includes('endleitung') && !o.vosNumber);
  
  fttbOrders.forEach(o => {
    let orderExportBase = 0;
    o.services.forEach(s => {
      if (!s.serviceItem.name.toLowerCase().includes('anfahrt') && s.serviceItem.name !== 'DPU Aufbau') {
         if (s.serviceItem.name === 'Optional / Material (FTTB)') {
            orderExportBase += s.priceApplied || 0;
         } else {
            orderExportBase += s.quantity * (s.serviceItem.defaultPrice || 0);
         }
      }
    });
    exportBase += orderExportBase;

    const effDate = o.kundenTerminStart || o.updatedAt;
    const dateStr = effDate ? effDate.toISOString().split('T')[0] : 'unknown';
    const key = `${dateStr}_${o.vehicle || 'Pool'}`;
    exportAnfahrtGroups[key] = (exportAnfahrtGroups[key] || 0) + 1;
  });

  Object.values(exportAnfahrtGroups).forEach(count => {
    if (count > 0) exportAnfahrt += count >= 12 ? priceFttbGt12 : priceFttbLt12;
  });

  console.log('DASHBOARD BASE:', dashboardBase, 'ANFAHRT:', dashboardAnfahrt, 'TOTAL:', dashboardBase + dashboardAnfahrt);
  console.log('EXPORT BASE:', exportBase, 'ANFAHRT:', exportAnfahrt, 'TOTAL:', exportBase + exportAnfahrt);
  console.log('DIFFERENCE BASE:', exportBase - dashboardBase);
  console.log('DIFFERENCE ANFAHRT:', exportAnfahrt - dashboardAnfahrt);

  console.log('\n--- FINDING THE CULPRIT ---');
  if (exportBase !== dashboardBase) {
      console.log('Base values differ!');
  }
  if (exportAnfahrt !== dashboardAnfahrt) {
      console.log('Anfahrt values differ! Keys in dashboard:', Object.keys(anfahrtGroups).length, 'Keys in export:', Object.keys(exportAnfahrtGroups).length);
      for (const key of Object.keys(exportAnfahrtGroups)) {
          if (!anfahrtGroups[key]) console.log('Export has Anfahrt for key:', key, 'but Dashboard does not.');
          else if (anfahrtGroups[key] !== exportAnfahrtGroups[key]) console.log('Mismatch for key:', key, 'Dash:', anfahrtGroups[key], 'Exp:', exportAnfahrtGroups[key]);
      }
      for (const key of Object.keys(anfahrtGroups)) {
          if (!exportAnfahrtGroups[key]) console.log('Dashboard has Anfahrt for key:', key, 'but Export does not.');
      }
  }
}
run();
