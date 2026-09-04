import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  let log = "";
  
  // 1. Fix the orderType for previously restored orders
  const fixedOrders = await prisma.order.updateMany({
    where: { orderType: 'FTTB' },
    data: { orderType: 'FTTB Bereitstellung' }
  });
  
  if (fixedOrders.count > 0) {
    log += `${fixedOrders.count} Auftraege von "FTTB" auf "FTTB Bereitstellung" korrigiert.\n\n`;
  }

  // 2. Restore truly missing customers
  const missingCustomers = await prisma.customer.findMany({
    include: { orders: true }
  });

  const trulyMissing = missingCustomers.filter(c => c.orders.length === 0);
  
  if (trulyMissing.length === 0) {
    log += "Keine weiteren fehlenden Auftraege gefunden.";
    return new NextResponse(log, { headers: { 'Content-Type': 'text/plain' } });
  }

  log += `Gefunden: ${trulyMissing.length} Kunden ohne Auftraege. Stelle wieder her...\n\n`;

  const abbruchItem = await prisma.serviceItem.findFirst({ where: { name: 'Abbruch' } });

  for (const c of trulyMissing) {
    await prisma.order.create({
      data: {
        customerId: c.id,
        status: 'Abbruch', // Defaulting to Abbruch based on context
        isBilled: true,
        orderValue: 20,
        kundenTerminStart: new Date('2026-09-02T10:00:00.000Z'), // Fallback date
        orderType: 'FTTB Bereitstellung',
        vehicle: 'Auto 1', // Fallback vehicle
        billingDate: new Date(),
        services: abbruchItem ? {
          create: [
            {
              serviceItemId: abbruchItem.id,
              quantity: 1,
              priceApplied: 20
            }
          ]
        } : undefined
      }
    });
    log += `- ${c.customerName} wiederhergestellt.\n`;
  }

  return new NextResponse(log, { headers: { 'Content-Type': 'text/plain' } });
}
