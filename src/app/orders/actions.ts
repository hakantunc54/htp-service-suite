"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrders() {
  return await prisma.order.findMany({
    include: {
      customer: true,
      services: true
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

  // Bestimme den finalen Status anhand der abgerechneten Positionen
  const serviceItemIds = items.map(i => i.serviceItemId);
  const billedServiceItems = await prisma.serviceItem.findMany({
    where: { id: { in: serviceItemIds } }
  });
  
  const hasAbbruch = billedServiceItems.some(si => 
    si.name.toLowerCase().includes("abbruch") || si.name.toLowerCase().includes("kvhdf")
  );
  const finalStatus = hasAbbruch ? "Abbruch" : "Erfolgreich abgeschlossen";

  // Update order totals
  await prisma.order.update({
    where: { id: orderId },
    data: {
      isBilled: true,
      orderValue: totalAmount,
      status: finalStatus,
      apartmentLocation,
        technicianRemark,
          ...(vehicle !== undefined && { vehicle }),
          ...(bdeStatus !== undefined && { bdeStatus }),
          ...(materialDetails !== undefined && { materialDetails })
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

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    revalidatePath("/orders");
    revalidatePath("/billing");
    return { success: true };
  } catch (error) {
    console.error("Fehler beim L�schen des Auftrags:", error);
    return { success: false, error: "Auftrag konnte nicht gel�scht werden" };
  }
}
