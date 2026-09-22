"use server";

import { PrismaClient } from '@prisma/client';
import { Vehicle } from '@/types';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrdersForPlanning() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ["Erfolgreich abgeschlossen", "Storniert", "Storno HTP", "Abbruch", "Abgerechnet", "Archiviert", "Termin abstimmen"]
      }
    },
    include: {
      customer: true,
      history: {
        where: { type: "NOTE" },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      building: {
        include: {
          entries: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Für jeden Auftrag vorherige Bemerkungen an der gleichen Adresse ermitteln
  const ordersWithPrevRemarks = await Promise.all(orders.map(async (order) => {
    let previousRemarks: string[] = [];
    
    if (order.buildingId) {
      // Vorherige abgerechnete Aufträge an der gleichen Adresse
      const prevOrders = await prisma.order.findMany({
        where: {
          buildingId: order.buildingId,
          id: { not: order.id },
          isBilled: true,
        },
        select: {
          status: true,
          billingRemark: true,
          technicianRemark: true,
          orderType: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      });
      
      for (const prev of prevOrders) {
        const remarkParts: string[] = [];
        if (prev.status === "Abbruch") remarkParts.push("ABBRUCH");
        if (prev.technicianRemark) remarkParts.push(prev.technicianRemark);
        else if (prev.billingRemark) remarkParts.push(prev.billingRemark);
        
        if (remarkParts.length > 0) {
          const date = prev.updatedAt.toLocaleDateString('de-DE');
          previousRemarks.push(`[${date}] ${remarkParts.join(' - ')}`);
        }
      }
    }
    
    return { ...order, previousRemarks };
  }));

  return ordersWithPrevRemarks;
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
