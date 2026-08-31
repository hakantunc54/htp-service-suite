import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.orderServiceItem.findMany({
    include: {
      serviceItem: true,
      order: {
        include: { customer: true }
      }
    }
  });

  let fixedCount = 0;
  let log = "";
  for (const item of items) {
    const isVariable = item.serviceItem.name.toLowerCase().includes("optional") || item.serviceItem.name.toLowerCase().includes("material");
    
    if (!isVariable && item.quantity > 0) {
      const expectedTotal = item.quantity * (item.serviceItem.defaultPrice || 0);
      
      // If the currently saved priceApplied equals the single unit price (defaultPrice) instead of the multiplied total, it's a bug!
      if (item.priceApplied !== expectedTotal && item.priceApplied === item.serviceItem.defaultPrice && item.quantity > 1) {
        log += `Fixed ${item.order.customer?.customerName || 'Unknown'} (${item.serviceItem.name}): qty ${item.quantity}, old price ${item.priceApplied} EUR -> new price ${expectedTotal} EUR\n`;
        
        await prisma.orderServiceItem.update({
          where: { id: item.id },
          data: { priceApplied: expectedTotal }
        });
        
        // Also update the total order value
        const allItemsInOrder = await prisma.orderServiceItem.findMany({ where: { orderId: item.orderId } });
        const newOrderTotal = allItemsInOrder.reduce((sum, i) => sum + (i.id === item.id ? expectedTotal : i.priceApplied), 0);
        
        await prisma.order.update({
          where: { id: item.orderId },
          data: { orderValue: newOrderTotal }
        });
        
        fixedCount++;
      }
    }
  }
  
  if (fixedCount === 0) {
    return new NextResponse("Everything is already perfect! No corruptions found.", { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  return new NextResponse(`Successfully fixed ${fixedCount} corrupted orders!\n\n${log}\n\nYou can now check your Dashboard, it should match the Excel Export perfectly!`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
