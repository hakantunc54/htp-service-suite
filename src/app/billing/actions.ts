"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getBillingData() {
  return await prisma.order.findMany({
    where: {
      status: { in: ["Erfolgreich abgeschlossen", "Abbruch"] }
    },
    include: {
      customer: true,
      services: { include: { serviceItem: true } }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
}

export async function updateOrderBilling(orderId: string, value: number, isBilled: boolean) {
  await prisma.order.update({
    where: { id: orderId },
    data: { 
      orderValue: value,
      isBilled,
      billingDate: isBilled ? new Date() : null,
      status: isBilled ? "Abgerechnet" : "Erfolgreich abgeschlossen"
    }
  });
  
  if (isBilled) {
    await prisma.historyEntry.create({
      data: {
        orderId,
        type: "SYSTEM",
        content: `Auftrag abgerechnet mit Summe: ${value.toFixed(2)} €`
      }
    });
  }

  revalidatePath('/billing');
  revalidatePath('/'); // Refresh dashboard
  return { success: true };
}
