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
      },
      services: {
        include: {
          serviceItem: true
        }
      }
    }
  });
}

export async function getAvailableServiceItems() {
  return await prisma.serviceItem.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function updateOrderServices(orderId: string, servicesToSave: { serviceItemId: string, quantity: number, priceApplied: number }[]) {
  // First, calculate new order value
  const newOrderValue = servicesToSave.reduce((sum, item) => sum + (item.priceApplied * item.quantity), 0);

  // Use a transaction to delete old services, insert new ones, and update order value
  await prisma.$transaction(async (tx) => {
    // Delete existing
    await tx.orderServiceItem.deleteMany({
      where: { orderId }
    });

    // Create new
    if (servicesToSave.length > 0) {
      await tx.orderServiceItem.createMany({
        data: servicesToSave.map(s => ({
          orderId,
          serviceItemId: s.serviceItemId,
          quantity: s.quantity,
          priceApplied: s.priceApplied
        }))
      });
    }

    // Update order value
    await tx.order.update({
      where: { id: orderId },
      data: { orderValue: newOrderValue }
    });
    
    // Add history entry
    await tx.historyEntry.create({
      data: {
        orderId,
        type: "SYSTEM",
        content: `Abgerechnete Leistungen wurden bearbeitet (Neuer Gesamtwert: ${newOrderValue.toFixed(2).replace('.', ',')} EUR)`
      }
    });
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true, newOrderValue };
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
