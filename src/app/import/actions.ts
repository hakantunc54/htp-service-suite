"use server";

import { PrismaClient } from '@prisma/client';
import { OrderStatus, CommunicationStatus } from '@/types';
import { ParsedOrder } from '@/lib/parser';

const prisma = new PrismaClient();

export async function saveImportedOrders(orders: ParsedOrder[]) {
  try {
    for (const orderData of orders) {
      // Create or find customer
      let customer = await prisma.customer.findUnique({
        where: { customerNumber: orderData.customerNumber || "N/A" }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            customerNumber: orderData.customerNumber,
            customerName: orderData.customerName,
            phone: orderData.phone,
            address: orderData.address
          }
        });
      }

      // Create order
      const newOrder = await prisma.order.create({
        data: {
          customerId: customer.id,
          htpPlanfenster: orderData.htpPlanfenster,
          orderType: orderData.orderType,
          status: orderData.isTerminabsprache ? OrderStatus.TERMIN_ABSTIMMEN : OrderStatus.NEU,
          communicationStatus: orderData.isTerminabsprache ? CommunicationStatus.NOCH_NICHT_KONTAKTIERT : CommunicationStatus.NOCH_NICHT,
          
          vosNumber: orderData.vosNumber,
          broadbandTechnology: orderData.broadbandTechnology,
          port: orderData.port,
        }
      });
      
      if (orderData.isTerminabsprache) {
        await prisma.historyEntry.create({
          data: {
            orderId: newOrder.id,
            type: "SYSTEM",
            content: "Terminabsprachen-Auftrag importiert"
          }
        });
      }
    }
    return { success: true, count: orders.length };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, error: String(error) };
  }
}

export async function checkImportWarnings(orders: ParsedOrder[]) {
  const warnings = [];
  
  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const orderWarnings = [];
    
    // 1. Check if customer exists (by CustomerNumber)
    if (o.customerNumber) {
      const existingCust = await prisma.customer.findUnique({
        where: { customerNumber: o.customerNumber }
      });
      if (existingCust) {
        orderWarnings.push(`Kunde bereits im CRM vorhanden (${existingCust.customerName}). Neuer Auftrag wird der Akte hinzugefügt.`);
      }
    }
    
    // 2. Check if address exists (could be a different customer in the same building)
    if (o.address) {
      // Basic match for street and number, ignoring zip and city to be broad enough
      // But exact match on address field is easiest for now.
      // We will do a 'contains' search for the street part to catch same buildings
      
      const addressParts = o.address.split(',');
      const streetPart = addressParts[0]?.trim();
      
      if (streetPart && streetPart.length > 5) { // e.g. "Sottrumer Straße 11"
        const existingBuildingCustomers = await prisma.customer.findMany({
          where: {
            address: {
              contains: streetPart
            },
            // Exclude current customer if they already exist
            NOT: o.customerNumber ? { customerNumber: o.customerNumber } : undefined
          },
          select: { customerName: true }
        });
        
        if (existingBuildingCustomers.length > 0) {
          const names = existingBuildingCustomers.map(c => c.customerName).join(', ');
          orderWarnings.push(`Achtung: Historie im selben Gebäude vorhanden! Bisherige Kunden dort: ${names}. Bitte ggf. Notizen prüfen.`);
        }
      }
    }
    
    warnings.push(orderWarnings);
  }
  
  return warnings;
}

export async function saveHistoricalExcelData(rows: any[], priceOverrides?: Record<string, number>) {
  try {
    const serviceItems = await prisma.serviceItem.findMany();
    
    // Mapping von Excel Spalte zu DB ServiceItem Name
    const columnMap: Record<string, string> = {
      "FTTB": "FTTB",
      "Abbruch": "Abbruch",
      "Anfahrt >12": "Anfahrt >12",
      "Anfahrt\n<12": "Anfahrt <12", "Anfahrt\r\n<12": "Anfahrt <12", // if they have it like this
      "Anfahrt <12": "Anfahrt <12",
      "MAW (5Min)": "MAW (5Min)",
      "PCI": "PCI",
      "vLauiAPLe": "vLauiAPLe",
      "Warten 5Min": "Warten 5Min",
      "Warten 10Min": "Warten 10Min",
      "fZugang DPU/APL": "fZugang DPU/APL",
      "KvHdF": "KvHdF",
      "Dispo": "Dispo",
      "optional": "Optional / Material (FTTB)",
      "Arbeitszeit": "Arbeitszeit (Std.)",
      "Anfahrt": "Anfahrt (BDE)",
      "Material": "Material (BDE)",
    };

    let importedCount = 0;

    for (const row of rows) {
      const custName = row["Kunde Name"] || row["Kunden Name"] || row["Kundenname"] || row["Name"] || row["Kunde"];
      
      // LOG ROW FOR DEBUGGING
      if (importedCount === 0) {
        require('fs').writeFileSync('last_excel_row.json', JSON.stringify(row, null, 2));
      }
      if (!row["Kunde Name"] && !row["Kunden Name"] && !row["Kunde"] && !row["Name"]) continue;


      // custName already defined above
      let custNum = row["Kunden Nummer"] || row["Kunden\nNummer"] || row["Kunden\r\nNummer"] || row["KdNr"] || row["Kd-Nr"] || row["Kd-Nr."] || row["Kundennummer"] || row["Kunden-Nummer"] || row["Kunden Nr"] || row["Kunde Nr"] || row["Kunde-Nr"] || row["Kunden Nr."] || "";
      if (custNum) custNum = String(custNum);
        const phone = String(row["Kunde RufNr"] || row["Telefon"] || "");
      const street = String(row["Strasse"] || "");
      const nr = String(row["Nr"] || "");
      const plz = String(row["PLZ"] || "");
      const ort = String(row["Ort"] || "");
      const address = `${street} ${nr}, ${plz} ${ort}`.trim();
      const port = row["Port"] || "";
      const bem = row["Bemerkung"] || "";
      const weLage = row["WE Lage"] || row["WE\nLage"] || row["WE\r\nLage"] || "";
      const dateStr = row["Termin"];
      const vehicle = String(row["Techniker"] || "");
      const orderType = row._SourceType === "BDE" ? "BdE (Bau der Endleitung)" : "FTTB Bereitstellung";

      let termin = new Date();
      if (dateStr instanceof Date) {
        termin = dateStr;
      } else if (typeof dateStr === "string" && dateStr.trim()) {
        const parts = dateStr.split(".");
        if (parts.length === 3) {
          termin = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
        } else {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) termin = parsed;
        }
      }

      // 1. Kunde finden oder erstellen
      let customer = null;
      if (custNum) {
        customer = await prisma.customer.findUnique({ where: { customerNumber: custNum } });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            customerNumber: custNum || `TMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
            customerName: custName,
            phone: phone,
            address: address
          }
        });
      }

      // 2. Order anlegen (als Abgeschlossen)
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderType,
          status: "Erfolgreich abgeschlossen",
          communicationStatus: "NOCH_NICHT",
          kundenTerminStart: termin,
          vehicle,
          port,
          technicianRemark: bem,
          apartmentLocation: weLage,
          isBilled: true,
          orderValue: 0 // Wird gleich berechnet
        }
      });

      // 3. Service Items verknuepfen und OrderValue berechnen
      let totalValue = 0;
      
      for (const [colName, val] of Object.entries(row)) {
        const itemVal = Number(val);
        if (isNaN(itemVal) || itemVal <= 0) continue; // Keine Menge = überspringen
        
        // Versuche die Spalte zu matchen
        const targetName = columnMap[colName] || (colName === "optional" && row._SourceType === "BDE" ? "Optional (BDE)" : columnMap[colName]);
        
        if (targetName) {
          const si = serviceItems.find(i => i.name === targetName);
          if (si) {
            let priceToApply = 0;
            let qty = itemVal;

            if (targetName.toLowerCase().includes("optional") || targetName.toLowerCase().includes("material")) {
               // Wenn es Variabel ist, ist die Menge = 1 und der Preis = der Wert aus der Excel
               priceToApply = itemVal;
               qty = 1;
            } else {
               const customPrice = (priceOverrides && priceOverrides[targetName] !== undefined) ? priceOverrides[targetName] : (si.defaultPrice || 0);
                 priceToApply = customPrice * qty;
            }

            await prisma.orderServiceItem.create({
              data: {
                orderId: order.id,
                serviceItemId: si.id,
                quantity: qty,
                priceApplied: priceToApply
              }
            });

            totalValue += priceToApply;
          }
        }
      }

      // OrderValue updaten
      await prisma.order.update({
        where: { id: order.id },
        data: { orderValue: totalValue }
      });

      importedCount++;
    }

    return { success: true, count: importedCount };
  } catch (error) {
    console.error("Save Excel Error:", error);
    return { success: false, error: String(error) };
  }
}




