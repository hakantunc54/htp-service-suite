import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const month = 2; // March
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
  const anfahrtGroups: Record<string, number> = {};
  
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
    const dateStr = date ? date.toISOString().split('T')[0] : 'unknown';
    const groupKey = `${dateStr}_${o.vehicle || 'Pool'}`;
    
    anfahrtGroups[groupKey] = (anfahrtGroups[groupKey] || 0) + 1;
  });

  Object.values(anfahrtGroups).forEach(count => {
    if (count > 0) dashboardAnfahrt += count >= 12 ? priceFttbGt12 : priceFttbLt12;
  });

  let exportBase = 0;
  let exportAnfahrt = 0;
  const exportAnfahrtGroups: Record<string, number> = {};
  
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

  let log = `DASHBOARD BASE: ${dashboardBase}, ANFAHRT: ${dashboardAnfahrt}, TOTAL: ${dashboardBase + dashboardAnfahrt}\n`;
  log += `EXPORT BASE: ${exportBase}, ANFAHRT: ${exportAnfahrt}, TOTAL: ${exportBase + exportAnfahrt}\n`;
  log += `DIFFERENCE BASE: ${exportBase - dashboardBase}\n`;
  log += `DIFFERENCE ANFAHRT: ${exportAnfahrt - dashboardAnfahrt}\n\n`;

  log += `--- CULPRITS ---\n`;
  for (const key of Object.keys(exportAnfahrtGroups)) {
      if (!anfahrtGroups[key]) log += `Export has Anfahrt for key: ${key}, but Dashboard does not.\n`;
      else if (anfahrtGroups[key] !== exportAnfahrtGroups[key]) {
          log += `Mismatch for key: ${key}, Dash: ${anfahrtGroups[key]}, Exp: ${exportAnfahrtGroups[key]}\n`;
      }
  }
  for (const key of Object.keys(anfahrtGroups)) {
      if (!exportAnfahrtGroups[key]) log += `Dashboard has Anfahrt for key: ${key}, but Export does not.\n`;
  }

  // Find corrupted prices again?
  for (const o of fttbOrders) {
      let dashB = 0;
      let expB = 0;
      o.services.forEach(s => {
          if (!s.serviceItem.name.toLowerCase().includes('anfahrt') && s.serviceItem.name !== 'DPU Aufbau') {
             dashB += s.priceApplied || 0;
             if (s.serviceItem.name === 'Optional / Material (FTTB)') {
                 expB += s.priceApplied || 0;
             } else {
                 expB += s.quantity * (s.serviceItem.defaultPrice || 0);
             }
          }
      });
      if (dashB !== expB) {
          log += `Base difference in Order ${o.id} (${o.customer?.customerName}): Dash ${dashB}, Exp ${expB}\n`;
      }
  }

  return new NextResponse(log, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
