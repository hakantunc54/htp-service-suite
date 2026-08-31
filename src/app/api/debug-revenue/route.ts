import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = parseInt(url.searchParams.get('month') || '7'); // 7 = August (0-indexed in JS)
  const year = parseInt(url.searchParams.get('year') || '2026');

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
  const priceFttbLt12 = serviceItems.find(i => i.name.includes("<12"))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes(">12"))?.defaultPrice || 55;
  
  let dashboardBase = 0;
  let dashboardAnfahrt = 0;
  
  const anfahrtGroups: Record<string, number> = {};
  
  // Dashboard Logic
  orders.forEach(o => {
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
    if (isBDE) return;

    let val = 0;
    if (o.services && o.services.length > 0) {
      o.services.forEach(s => {
        if (!s.serviceItem.name.toLowerCase().includes('anfahrt')) {
          val += s.priceApplied || 0;
        }
      });
    } else {
      val = o.orderValue || 0;
    }
    dashboardBase += val;

    const date = o.kundenTerminStart || o.updatedAt;
    const dateStr = date.toISOString().split('T')[0];
    const groupKey = `${dateStr}_${o.vehicle || 'Pool'}`;
    
    anfahrtGroups[groupKey] = (anfahrtGroups[groupKey] || 0) + 1;
  });

  Object.values(anfahrtGroups).forEach(count => {
    if (count > 0) {
      dashboardAnfahrt += count >= 12 ? priceFttbGt12 : priceFttbLt12;
    }
  });

  const dashboardTotal = dashboardBase + dashboardAnfahrt;

  // Export Logic Simulation (using DB default prices since Export multiplies by header prices which we assume match DB defaults)
  let exportBase = 0;
  let exportAnfahrt = 0;
  
  const fttbOrders = orders.filter(o => o.orderType && !o.orderType.toLowerCase().includes('bde') && !o.orderType.toLowerCase().includes('endleitung') && !o.vosNumber);
  
  const exportAnfahrtGroups: Record<string, number> = {};
  
  fttbOrders.forEach(o => {
    let orderExportBase = 0;
    o.services.forEach(s => {
      if (!s.serviceItem.name.toLowerCase().includes('anfahrt') && s.serviceItem.name !== "DPU Aufbau") {
         // Export outputs quantity. User multiplies by header in Excel. We assume header = defaultPrice.
         // Except for 'Optional / Material (FTTB)' which uses priceApplied in export.
         if (s.serviceItem.name === "Optional / Material (FTTB)") {
            orderExportBase += s.priceApplied;
         } else {
            orderExportBase += s.quantity * s.serviceItem.defaultPrice;
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
    if (count > 0) {
      exportAnfahrt += count >= 12 ? priceFttbGt12 : priceFttbLt12;
    }
  });

  const exportTotal = exportBase + exportAnfahrt;

  let report = `DEBUG REVENUE REPORT FOR AUGUST 2026\n`;
  report += `====================================\n\n`;
  
  report += `1. DASHBOARD LOGIC (What the chart shows)\n`;
  report += `Base FTTB Revenue (Sum of historical priceApplied): ${dashboardBase} EUR\n`;
  report += `Anfahrt Revenue (Dynamically added): ${dashboardAnfahrt} EUR\n`;
  report += `TOTAL DASHBOARD FTTB: ${dashboardTotal} EUR\n\n`;

  report += `2. EXCEL EXPORT LOGIC (Assuming Excel Headers match DB Default Prices)\n`;
  report += `Base FTTB Revenue (Quantity * Default Price): ${exportBase} EUR\n`;
  report += `Anfahrt Revenue (Dynamically added): ${exportAnfahrt} EUR\n`;
  report += `TOTAL EXPORT FTTB: ${exportTotal} EUR\n\n`;
  
  report += `DIFFERENCE: ${Math.abs(dashboardTotal - exportTotal)} EUR\n\n`;
  
  report += `ANALYSIS OF DIFFERENCE:\n`;
  if (dashboardTotal !== exportTotal) {
      if (dashboardAnfahrt !== exportAnfahrt) {
          report += `- Anfahrt calculation differs! Dashboard counts ${Object.keys(anfahrtGroups).length} vehicle-days, Export counts ${Object.keys(exportAnfahrtGroups).length} vehicle-days.\n`;
          report += `- This is likely because Export IGNORES orders with a blank OrderType, while Dashboard includes them in FTTB!\n`;
      }
      if (dashboardBase !== exportBase) {
          report += `- Base revenue differs! Dashboard sum of priceApplied is ${dashboardBase}, but Export Quantity * CurrentPrice is ${exportBase}.\n`;
          report += `- This happens if you changed prices in the CRM settings recently. Dashboard uses the old prices from when the order was billed, but your Excel multiplies everything by the new prices!\n`;
      }
  } else {
      report += `- The CRM logic perfectly matches! If your Excel sheet says 15.005,50 €, it means you typed a different price in your Excel Headers than what is saved in the CRM Settings!\n`;
  }

  return new NextResponse(report, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
