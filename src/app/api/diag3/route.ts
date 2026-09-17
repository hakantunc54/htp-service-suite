import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const allBilledOrders = await prisma.order.findMany({
    where: { isBilled: true },
    include: { services: { include: { serviceItem: true } }, customer: true }
  });

  let janBdeTotal = 0;
  let log = "";
  
  for (const o of allBilledOrders) {
    const date = o.kundenTerminStart || o.updatedAt;
    
    // Exact dashboard timezone logic
    const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
    const [yStr, mStr, dStr] = dateStr.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;

    if (month === 0) { // Jan
      const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      if (isBDE) {
        let val = 0;
        o.services.forEach(s => {
          if (!s.serviceItem.name.toLowerCase().includes('anfahrt')) {
            val += s.priceApplied || 0;
          }
        });
        if (val > 0) {
          log += `Jan BDE: ${o.id} - ${o.customer?.customerName} - ${val} EUR - orderType: ${o.orderType}, vosNumber: ${o.vosNumber}\n`;
          janBdeTotal += val;
        }
      }
    }
  }
  
  return new NextResponse(`Total Jan BDE (Base, no Anfahrt): ${janBdeTotal}\n\n` + log, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
