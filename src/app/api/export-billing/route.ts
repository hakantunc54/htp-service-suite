import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json({ error: "Start- und Enddatum erforderlich" }, { status: 400 });
    }

    const startDate = new Date(startParam);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endParam);
    endDate.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        isBilled: true,
        OR: [
          {
            kundenTerminStart: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            kundenTerminStart: null,
            updatedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      },
      include: {
        customer: true,
        services: {
          include: {
            serviceItem: true
          }
        },
        history: {
          where: { type: "NOTE" },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        kundenTerminStart: 'asc'
      }
    });

    // Helper zur Adress-Trennung
    const parseAddress = (fullAddress: string) => {
      // z.B. "Sottrumer Straße 11, 31188 Holle"
      let street = "";
      let nr = "";
      let plz = "";
      let ort = "";

      try {
        const parts = fullAddress.split(',');
        if (parts.length >= 2) {
          const streetPart = parts[0].trim();
          const cityPart = parts[1].trim();

          // Strasse und Nr trennen (Suche nach der letzten Zahl)
          const matchStreet = streetPart.match(/^(.*?)\s+(\d+[a-zA-Z]*)$/);
          if (matchStreet) {
            street = matchStreet[1];
            nr = matchStreet[2];
          } else {
            street = streetPart; // Fallback
          }

          // PLZ und Ort trennen
          const matchCity = cityPart.match(/^(\d{5})\s+(.*)$/);
          if (matchCity) {
            plz = matchCity[1];
            ort = matchCity[2];
          } else {
            ort = cityPart; // Fallback
          }
        } else {
          street = fullAddress;
        }
      } catch (e) {
        street = fullAddress;
      }

      return { plz, ort, street, nr };
    };

    // Daten splitten
    const fttbOrders = orders.filter((o: any) => o.orderType && !o.orderType.toLowerCase().includes('bde') && !o.orderType.toLowerCase().includes('endleitung') && !o.vosNumber);
    const bdeOrders = orders.filter((o: any) => o.orderType && (o.orderType.toLowerCase().includes('bde') || o.orderType.toLowerCase().includes('endleitung') || o.vosNumber));

    // Gruppierung für FTTB Anfahrt (Nach Datum und Auto)
    const fttbGroups: Record<string, typeof fttbOrders> = {};
    fttbOrders.forEach((o: any) => {
      const effDate = o.kundenTerminStart || o.updatedAt;
      const dateStr = effDate ? effDate.toISOString().split('T')[0] : 'unknown';
      const key = `${dateStr}_${o.vehicle || 'Pool'}`;
      if (!fttbGroups[key]) fttbGroups[key] = [];
      fttbGroups[key].push(o);
    });

    const fttbRows = [];
    for (const [key, groupOrders] of Object.entries(fttbGroups)) {
      const count = groupOrders.length;
      let isFirst = true;

      for (const order of groupOrders) {
        const addr = parseAddress(order.customer.address);
        
        // Finde ServiceItems
        const getQty = (name: string) => {
          const item = order.services.find((si: any) => si.serviceItem.name === name);
          return item ? item.quantity : '';
        };
        const getAmount = (name: string) => {
          const item = order.services.find((si: any) => si.serviceItem.name === name);
          return item ? item.priceApplied : ''; 
        };

        const effDate = order.kundenTerminStart || order.updatedAt;
        const row = {
          "Termin": effDate ? effDate.toLocaleDateString('de-DE') : "",
          "PLZ": addr.plz,
          "Ort": addr.ort,
          "Strasse": addr.street,
          "Nr": addr.nr,
          "Techniker": order.vehicle,
          "Port": order.port || "",
          "Kunde Name": order.customer.customerName,
          "Kunden\nNummer": order.customer.customerNumber,
          "Kunde RufNr": order.customer.phone || order.customer.mobile,
          "Status": (Number(getQty("Abbruch")) > 0 || Number(getQty("KvHdF")) > 0) ? "Abgebrochen" : "Erledigt",
          "Bemerkung": order.technicianRemark || "",
          "WE\nLage": order.apartmentLocation || "",
          "FTTB": getQty("FTTB"),
          "Abbruch": getQty("Abbruch"),
          "Anfahrt >12": isFirst && count >= 12 ? 1 : "",
          "Anfahrt\n<12": isFirst && count < 12 ? 1 : "",
          "MAW (5Min)": getQty("MAW (5Min)"),
          "PCI": getQty("PCI"),
          "vLauiAPLe": getQty("vLauiAPLe"),
          "Warten 5Min": getQty("Warten 5Min"),
          "Warten 10Min": getQty("Warten 10Min"),
          "fZugang DPU/APL": getQty("fZugang DPU/APL"),
          "KvHdF": getQty("KvHdF"),
          "Dispo": getQty("Dispo"),
          "optional": getAmount("Optional / Material (FTTB)")
        };

        fttbRows.push(row);
        isFirst = false;
      }
    }

    // Gruppierung für BDE Anfahrt
    const bdeGroups: Record<string, typeof bdeOrders> = {};
    bdeOrders.forEach((o: any) => {
      const effDate = o.kundenTerminStart || o.updatedAt;
      const dateStr = effDate ? effDate.toISOString().split('T')[0] : 'unknown';
      const key = `${dateStr}_${o.vehicle || 'Pool'}`;
      if (!bdeGroups[key]) bdeGroups[key] = [];
      bdeGroups[key].push(o);
    });

    const bdeRows = [];
    for (const [key, groupOrders] of Object.entries(bdeGroups)) {
      let isFirst = true;

      for (const order of groupOrders) {
        const addr = parseAddress(order.customer.address);
        
        const getQty = (name: string) => {
          const item = order.services.find((si: any) => si.serviceItem.name === name);
          return item ? item.quantity : '';
        };
        const getAmount = (name: string) => {
          const item = order.services.find((si: any) => si.serviceItem.name === name);
          return item ? item.priceApplied : ''; 
        };

        const effDate = order.kundenTerminStart || order.updatedAt;
        const row = {
          "Termin": effDate ? effDate.toLocaleDateString('de-DE') : "",
          "PLZ": addr.plz,
          "Ort": addr.ort,
          "Strasse": addr.street,
          "Nr": addr.nr,
          "Techniker": order.vehicle,
          "Port": order.port || "",
          "Kunde Name": order.customer.customerName,
          "Kunden\nNummer": order.customer.customerNumber,
          "Kunde RufNr": order.customer.phone || order.customer.mobile,
          "Status": (Number(getQty("Abbruch")) > 0 || Number(getQty("KvHdF")) > 0) ? "Abgebrochen" : "Erledigt",
          "Bemerkung": order.technicianRemark || "",
          "WE\nLage": order.apartmentLocation || "",
          "Stunden / Material": "",
          "Arbeitszeit": getQty("Arbeitszeit (Std.)"),
          "Anfahrt": isFirst ? 1 : "",
          "Material": getAmount("Material (BDE)"),
          "optional": getAmount("Optional (BDE)")
        };

        bdeRows.push(row);
        isFirst = false;
      }
    }

    // Zeilen sortieren: Erst nach Datum, dann nach Techniker (Auto 1, Auto 2 etc.)
    const sortRows = (a: any, b: any) => {
      // 1. Nach Datum (ISO-Format yyyy-mm-dd sortiert sich auch alphabetisch korrekt)
      const dateA = a.Termin.split('.').reverse().join('-'); // von DD.MM.YYYY zu YYYY-MM-DD
      const dateB = b.Termin.split('.').reverse().join('-');
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      // 2. Nach Techniker
      const techA = a.Techniker || "";
      const techB = b.Techniker || "";
      return techA.localeCompare(techB, undefined, { numeric: true, sensitivity: 'base' });
    };

    fttbRows.sort(sortRows);
    bdeRows.sort(sortRows);

    // Workbook erstellen
    const wb = xlsx.utils.book_new();

    if (fttbRows.length > 0) {
      const wsFTTB = xlsx.utils.json_to_sheet(fttbRows);
      xlsx.utils.book_append_sheet(wb, wsFTTB, "FTTB");
    } else {
      xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet([{"Hinweis": "Keine FTTB Abrechnungen in diesem Zeitraum"}]), "FTTB");
    }

    if (bdeRows.length > 0) {
      const wsBDE = xlsx.utils.json_to_sheet(bdeRows);
      xlsx.utils.book_append_sheet(wb, wsBDE, "BDE");
    } else {
      xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet([{"Hinweis": "Keine BDE Abrechnungen in diesem Zeitraum"}]), "BDE");
    }

    // Binärdaten generieren
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Abrechnung_${startParam}_bis_${endParam}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    });

  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}


