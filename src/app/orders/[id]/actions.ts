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
  
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "STATUS_CHANGE",
      content: `Status gendert auf: ${status}`
    }
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function cloneOrder(orderId: string) {
  const originalOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!originalOrder) throw new Error("Order not found");

  const newOrder = await prisma.order.create({
    data: {
      customerId: originalOrder.customerId,
      htpPlanfenster: originalOrder.htpPlanfenster,
      serviceWindow: originalOrder.serviceWindow,
      project: originalOrder.project,
      networkElement: originalOrder.networkElement,
      port: originalOrder.port,
      orderType: originalOrder.orderType,
      htpRemark: originalOrder.htpRemark,
      apartmentLocation: originalOrder.apartmentLocation,
      status: "Wartet auf HTP",
      communicationStatus: "NOCH_NICHT",
      technicianRemark: `Folgeauftrag aus vorherigem Abbruch am ${new Date().toLocaleDateString('de-DE')}`
    }
  });

  await prisma.historyEntry.create({
    data: {
      orderId: newOrder.id,
      type: "SYSTEM",
      content: `Auftrag als Folgeauftrag (Klon) von Original-Auftrag geklont.`
    }
  });
  
  await prisma.historyEntry.create({
    data: {
      orderId: originalOrder.id,
      type: "SYSTEM",
      content: `Auftrag wurde abgebrochen und ein Folgeauftrag (Klon) wurde erstellt.`
    }
  });

  revalidatePath(`/orders`);
  return { success: true, newOrderId: newOrder.id };
}
