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
