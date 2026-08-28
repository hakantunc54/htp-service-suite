"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getServiceItems() {
  return await prisma.serviceItem.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function saveBilling(
  orderId: string, 
  items: { serviceItemId: string; quantity: number; amount: number }[],
  totalAmount: number,
  apartmentLocation: string = "",
  technicianRemark: string = "",
  bdeStatus?: string,
  materialDetails?: string,
  vehicle?: string
) {
  // Loesche alte Positionen falls vorhanden
  await prisma.orderServiceItem.deleteMany({
    where: { orderId }
  });

  // Speichere neue Positionen
  for (const item of items) {
    await prisma.orderServiceItem.create({
      data: {
        orderId,
        serviceItemId: item.serviceItemId,
        quantity: item.quantity,
        priceApplied: item.amount
      }
    });
  }

  // Update order totals
  await prisma.order.update({
    where: { id: orderId },
    data: {
      isBilled: true,
      orderValue: totalAmount,
      status: "Erfolgreich abgeschlossen", // Set status to completed automatically when billed
      apartmentLocation,
      technicianRemark
    }
  });

  // Log to history
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "SYSTEM",
      content: `Abrechnung gespeichert. Summe: ${totalAmount.toFixed(2)} €`
    }
  });

  revalidatePath('/orders');
  revalidatePath('/billing');
  return { success: true };
}
