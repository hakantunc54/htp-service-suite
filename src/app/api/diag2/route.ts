import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const allOrders = await prisma.order.count();
  const billedOrders = await prisma.order.count({ where: { isBilled: true } });
  
  const revenue = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: true }
  });

  const abbruchCount = await prisma.order.count({ where: { status: "Abbruch" } });
  
  const missingCustomers = await prisma.customer.findMany({
    where: { 
      OR: [
        { customerName: { contains: "Entrup" } },
        { customerName: { contains: "Wackerbarth" } }
      ]
    },
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          isBilled: true,
          orderValue: true,
          kundenTerminStart: true,
          createdAt: true
        }
      }
    }
  });

  return NextResponse.json({
    totals: {
      allOrders,
      billedOrders,
      revenue: revenue._sum.orderValue,
      abbruchCount
    },
    missingCustomers
  });
}
