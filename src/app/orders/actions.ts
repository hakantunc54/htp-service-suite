"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { addAutoBuildingEntry, addBuildingEntry } from '@/app/buildings/actions';

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

/**
 * Datum des letzten Einsatzes beim gleichen Kunden (sonst im gleichen Objekt).
 * Wird für die Vorbefüllung "GEWÄHRLEISTUNG zu Einsatz vom ..." genutzt.
 */
export async function getPreviousVisitDate(orderId: string): Promise<string | null> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { customerId: true, buildingId: true } });
  if (!order) return null;

  const prev = await prisma.order.findFirst({
    where: {
      id: { not: orderId },
      OR: [
        { customerId: order.customerId },
        ...(order.buildingId ? [{ buildingId: order.buildingId }] : []),
      ],
      AND: [{ OR: [{ isBilled: true }, { status: { in: ["Abbruch", "Erfolgreich abgeschlossen", "Abgerechnet", "Gewährleistung"] } }] }],
    },
    orderBy: [{ kundenTerminStart: 'desc' }, { updatedAt: 'desc' }],
    select: { kundenTerminStart: true, updatedAt: true },
  });
  if (!prev) return null;
  const d = prev.kundenTerminStart || prev.updatedAt;
  return d.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function saveBilling(
  orderId: string, 
  items: { serviceItemId: string; quantity: number; amount: number }[],
  totalAmount: number,
  apartmentLocation: string = "",
  technicianRemark: string = "",
  bdeStatus?: string,
  materialDetails?: string,
  vehicle?: string,
  buildingRemark?: string,
  isWarranty: boolean = false
) {
  // Gewährleistung: keine Positionen, 0 € – Anfahrt wird im Export/Dashboard ebenfalls nicht gezählt
  if (isWarranty) {
    items = [];
    totalAmount = 0;
  }

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
  const finalStatus = isWarranty
    ? "Gewährleistung"
    : (hasAbbruch || bdeStatus === "Abbruch") ? "Abbruch" : "Erfolgreich abgeschlossen";

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
      content: isWarranty
        ? `🛡 Als Gewährleistung erfasst – nicht berechnet (0,00 €).`
        : `Abrechnung gespeichert. Summe: ${totalAmount.toFixed(2)} €`
    }
  });

  // ─── Objektbezogene Historie: Automatischer Eintrag ───
  try {
    const result = await addAutoBuildingEntry(orderId);
    
    // Wenn zusätzlich ein manueller Vermerk erstellt werden soll
    if (buildingRemark && buildingRemark.trim() && result?.building) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true }
      });
      await addBuildingEntry(result.building.id, {
        customerName: order?.customer.customerName,
        orderType: order?.orderType || undefined,
        apartmentLocation: apartmentLocation || undefined,
        remark: buildingRemark.trim(),
        orderId,
      });
    }
  } catch (e) {
    // Fehler bei der Objektzuordnung sollen die Abrechnung nicht blockieren
    console.error("Objektzuordnung fehlgeschlagen:", e);
  }

  revalidatePath('/orders');
  revalidatePath('/billing');
  revalidatePath('/buildings');
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
