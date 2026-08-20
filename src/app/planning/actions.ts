"use server";

import { PrismaClient } from '@prisma/client';
import { Vehicle } from '@/types';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrdersForPlanning() {
  return await prisma.order.findMany({
    where: {
      status: {
        notIn: ["Erfolgreich abgeschlossen", "Storniert", "Abgerechnet", "Archiviert", "Termin abstimmen"]
      }
    },
    include: {
      customer: true,
      history: {
        where: { type: "NOTE" },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
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
