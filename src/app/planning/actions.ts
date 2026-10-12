"use server";

import { PrismaClient } from '@prisma/client';
import { Vehicle, isKnownOrderType } from '@/types';
import { revalidatePath } from 'next/cache';
import { TERMINABSPRACHE_STATUSES, BDE_ORDER_TYPE_FILTER, DISPOSITION_EXCLUDED_STATUSES } from '@/lib/orderFilters';
import { normalizeAddress, formatObjectNumber } from '@/lib/normalizeAddress';

const prisma = new PrismaClient();

/** Hinweise zu Kunde/Objekt für Disposition und xRoute-Export */
export type SiteWarnings = {
  hasWarnings: boolean;
  visitCount: number;              // Anzahl vorheriger Einsätze (Kunde oder gleiches Objekt)
  objectNumber?: string;
  objectStatus?: string;           // GREEN | YELLOW | RED
  objectStatusNote?: string;
  access?: string;                 // Technikraum-Zugang / Schlüssel
  contact?: string;                // z.B. "Hausmeister Müller 0151 1234567"
  contactPhone?: string;
  previous: string[];              // "[16.09.2026] ABBRUCH - Kein Zutritt zur Technik"
};

/** Status, die als "dort waren wir schon" zählen */
const DONE_STATUSES = ["Abbruch", "Erfolgreich abgeschlossen", "Abgerechnet", "Kunde nicht angetroffen", "Archiviert", "Gewährleistung"];

/** Entfernt den automatischen Import-Hinweis ("ACHTUNG: Kunde hatte bereits ...") aus Bemerkungen */
function cleanRemark(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/ACHTUNG: Kunde(?:\/Port)? (?:hatte|war) bereits[\s\S]*?Bitte alte Aktennotizen(?: und Material)? prüfen!/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(d?: Date | null): string {
  return d ? new Date(d).toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" }) : "?";
}

export async function getOrdersForPlanning() {
  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: DISPOSITION_EXCLUDED_STATUSES },
      // BdE-Aufträge, die noch in der Terminabsprache sind (z.B. "Kunde nicht erreicht"),
      // gehören NICHT in die Disposition – erst nach "Termin vereinbart"
      NOT: {
        AND: [
          { OR: BDE_ORDER_TYPE_FILTER },
          { status: { in: TERMINABSPRACHE_STATUSES } }
        ]
      }
    },
    include: {
      customer: true,
      history: {
        where: { type: "NOTE" },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      building: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return await Promise.all(orders.map(async (order) => {
    // 1. Objekt ermitteln – neue Aufträge haben noch keine buildingId (wird erst bei Abrechnung gesetzt),
    //    daher Fallback über die normalisierte Adresse
    let building = order.building;
    if (!building && order.customer.address) {
      const norm = normalizeAddress(order.customer.address).normalized;
      if (norm) {
        building = await prisma.building.findUnique({ where: { normalizedAddress: norm } });
      }
    }

    // 2. Vorherige Einsätze: gleicher Kunde ODER gleiches Objekt
    const prevOrders = await prisma.order.findMany({
      where: {
        id: { not: order.id },
        OR: [
          { customerId: order.customerId },
          ...(building ? [{ buildingId: building.id }] : []),
        ],
        AND: [{ OR: [{ isBilled: true }, { status: { in: DONE_STATUSES } }] }],
      },
      select: {
        status: true,
        technicianRemark: true,
        billingRemark: true,
        kundenTerminStart: true,
        billingDate: true,
        updatedAt: true,
        customerId: true,
        customer: { select: { customerName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    const previous: string[] = [];
    for (const prev of prevOrders.slice(0, 3)) {
      const parts: string[] = [];
      // Bei anderem Kunden im selben Objekt den Namen dazuschreiben
      if (prev.customerId !== order.customerId) parts.push(`${prev.customer.customerName}:`);
      if (prev.status === "Abbruch") parts.push("ABBRUCH -");
      else if (prev.status === "Kunde nicht angetroffen") parts.push("NICHT ANGETROFFEN -");

      let remark = cleanRemark(prev.technicianRemark) || cleanRemark(prev.billingRemark);
      if (remark.length > 220) remark = remark.substring(0, 217) + "...";
      if (!remark && prev.status !== "Abbruch") continue; // Erfolgreich ohne Bemerkung = kein Hinweis nötig
      parts.push(remark || "(kein Grund eingetragen)");

      const date = formatDate(prev.kundenTerminStart || prev.billingDate || prev.updatedAt);
      previous.push(`[${date}] ${parts.join(" ")}`.replace(/ -$/, ""));
    }

    // 3. Objektinformationen
    const objectStatus = building?.objectStatus;
    const objectStatusNote = building?.objectStatusNote?.trim() || undefined;
    const access = [building?.techRoomAccess, building?.keyInfo].filter(Boolean).join(" / ") || undefined;

    let contact: string | undefined;
    let contactPhone: string | undefined;
    if (building?.primaryContact || building?.primaryContactPhone) {
      contact = [building.primaryContactRole, building.primaryContact].filter(Boolean).join(" ");
      contactPhone = building.primaryContactPhone || undefined;
    } else if (building?.caretaker || building?.caretakerPhone) {
      contact = `Hausmeister ${building.caretaker || ""}`.trim();
      contactPhone = building.caretakerPhone || undefined;
    } else if (building?.contactPerson || building?.contactPhone) {
      contact = building.contactPerson || "Ansprechpartner";
      contactPhone = building.contactPhone || undefined;
    }

    const siteWarnings: SiteWarnings = {
      hasWarnings: previous.length > 0 || (!!objectStatus && objectStatus !== "GREEN") || !!objectStatusNote || !!access,
      visitCount: prevOrders.filter(p => p.customerId === order.customerId).length,
      objectNumber: building ? formatObjectNumber(building.objectNumber) : undefined,
      objectStatus,
      objectStatusNote,
      access,
      contact: contact || undefined,
      contactPhone,
      previous,
    };

    return { ...order, siteWarnings };
  }));
}

export async function updateOrderType(orderId: string, orderType: string) {
  if (!isKnownOrderType(orderType)) {
    return { success: false, error: "Ungültiger Auftragstyp" };
  }
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { orderType }
    });
    await prisma.historyEntry.create({
      data: {
        orderId,
        type: "SYSTEM",
        content: `Auftragstyp manuell in der Disposition gesetzt: ${orderType}`
      }
    });
    revalidatePath('/planning');
    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error("Failed to update order type:", error);
    return { success: false, error: "Speichern fehlgeschlagen" };
  }
}

export async function assignVehicleToOrder(orderId: string, vehicle: string | null) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { vehicle }
    });
    revalidatePath('/planning');
    return { success: true };
  } catch (error) {
    console.error("Failed to assign vehicle:", error);
    return { success: false };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    revalidatePath('/planning');
    revalidatePath('/orders');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    return { success: false };
  }
}
