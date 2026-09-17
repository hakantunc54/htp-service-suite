import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { normalizeAddress, formatObjectNumber } from "@/lib/normalizeAddress";

const prisma = new PrismaClient();

/**
 * Einmaliger Migrations-Endpunkt:
 * Erstellt aus allen bereits abgerechneten Aufträgen Objekte + Historieneinträge.
 * 
 * Aufruf: GET /api/backfill-buildings
 */
export async function GET() {
  try {
    // Alle abgerechneten Aufträge laden (die noch kein Building haben)
    const orders = await prisma.order.findMany({
      where: {
        isBilled: true,
        buildingId: null,
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: "asc" },
    });

    let created = 0;
    let reused = 0;
    let entries = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        const parsed = normalizeAddress(order.customer.address);
        if (!parsed.normalized) {
          skipped++;
          errors.push(`Übersprungen (keine gültige Adresse): ${order.customer.address}`);
          continue;
        }

        // Objekt suchen oder anlegen
        let building = await prisma.building.findUnique({
          where: { normalizedAddress: parsed.normalized },
        });

        if (!building) {
          // Nächste freie Objektnummer
          const lastBuilding = await prisma.building.findFirst({
            orderBy: { objectNumber: "desc" },
            select: { objectNumber: true },
          });
          const nextNumber = (lastBuilding?.objectNumber || 0) + 1;

          building = await prisma.building.create({
            data: {
              street: parsed.street,
              houseNumber: parsed.houseNumber,
              zipCode: parsed.zipCode,
              city: parsed.city,
              normalizedAddress: parsed.normalized,
              objectNumber: nextNumber,
            },
          });
          created++;
        } else {
          reused++;
        }

        // Order mit Objekt verknüpfen
        await prisma.order.update({
          where: { id: order.id },
          data: { buildingId: building.id },
        });

        // Automatischen Historien-Eintrag erstellen
        await prisma.buildingEntry.create({
          data: {
            buildingId: building.id,
            orderId: order.id,
            customerName: order.customer.customerName,
            orderType: order.orderType || "Unbekannt",
            apartmentLocation: order.apartmentLocation || null,
            remark: order.status || "Abgeschlossen",
            isAutomatic: true,
          },
        });
        entries++;

        // lastVisitAt aktualisieren (auf Datum des Auftrags)
        const visitDate = order.updatedAt || order.createdAt;
        const current = building.lastVisitAt;
        if (!current || visitDate > current) {
          await prisma.building.update({
            where: { id: building.id },
            data: { lastVisitAt: visitDate },
          });
        }

      } catch (e: any) {
        errors.push(`Fehler bei Auftrag ${order.id} (${order.customer.address}): ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders: orders.length,
        buildingsCreated: created,
        buildingsReused: reused,
        entriesCreated: entries,
        skipped,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
