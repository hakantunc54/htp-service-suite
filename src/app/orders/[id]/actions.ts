"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getOrderDetails(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      history: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });
}

export async function getSmsTemplates() {
  return await prisma.smsTemplate.findMany();
}

export async function addHistoryEntry(orderId: string, type: string, content: string) {
  await prisma.historyEntry.create({
    data: {
      orderId,
      type,
      content
    }
  });
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string, communicationStatus?: string) {
  const data: any = { status };
  if (communicationStatus) {
    data.communicationStatus = communicationStatus;
  }
  
  await prisma.order.update({
    where: { id: orderId },
    data
  });
  
  // Also add a history entry for the status change automatically
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "STATUS_CHANGE",
      content: `Status geändert auf: ${status}`
    }
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}
