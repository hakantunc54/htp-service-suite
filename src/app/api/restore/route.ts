import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const entrup = await prisma.customer.findFirst({ where: { customerName: { contains: 'Entrup' } } });
  const wackerbarth = await prisma.customer.findFirst({ where: { customerName: { contains: 'Wackerbarth' } } });
  let log = "";

  if (entrup) {
    const existing = await prisma.order.findFirst({ where: { customerId: entrup.id } });
    if (!existing) {
      await prisma.order.create({
        data: {
          customerId: entrup.id,
          status: 'Abbruch',
          isBilled: true,
          orderValue: 20,
          kundenTerminStart: new Date('2026-09-02T07:30:00.000Z'),
          orderType: 'FTTB',
          vehicle: 'Auto 2',
          billingDate: new Date(),
          services: {
            create: [
              {
                serviceItemId: (await prisma.serviceItem.findFirst({ where: { name: 'Abbruch' } }))!.id,
                quantity: 1,
                priceApplied: 20
              }
            ]
          }
        }
      });
      log += "Entrup wiederhergestellt. ";
    }
  }

  if (wackerbarth) {
    const existing = await prisma.order.findFirst({ where: { customerId: wackerbarth.id } });
    if (!existing) {
      await prisma.order.create({
        data: {
          customerId: wackerbarth.id,
          status: 'Abbruch',
          isBilled: true,
          orderValue: 20,
          kundenTerminStart: new Date('2026-09-02T10:00:00.000Z'),
          orderType: 'FTTB',
          vehicle: 'Auto 1',
          billingDate: new Date(),
          services: {
            create: [
              {
                serviceItemId: (await prisma.serviceItem.findFirst({ where: { name: 'Abbruch' } }))!.id,
                quantity: 1,
                priceApplied: 20
              }
            ]
          }
        }
      });
      log += "Wackerbarth wiederhergestellt. ";
    }
  }

  return new NextResponse(log || "Schon wiederhergestellt.", { headers: { 'Content-Type': 'text/plain' } });
}
