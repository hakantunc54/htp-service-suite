"use server";

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { OrderStatus, CommunicationStatus } from '@/types';

const prisma = new PrismaClient();

export async function getTerminabsprachen() {
  return await prisma.order.findMany({
    where: {
      OR: [
        { orderType: { contains: "BdE" } },
        { orderType: { contains: "BDE" } },
        { orderType: { contains: "bde" } },
        { orderType: { contains: "Endleitung" } },
        { orderType: { contains: "endleitung" } }
      ],
      status: {
        in: [
          "Termin abstimmen", 
          "Neu",
          "Wartet auf HTP",
          "Kunde angerufen", 
          "Kunde erreicht", 
          "Kunde nicht erreicht", 
          "SMS Erstkontakt gesendet", 
          "SMS Erinnerung gesendet", 
          "Letzte Erinnerung gesendet", 
          "Kunde hat zurückgerufen"
        ]
      }
    },
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}

export async function updateTerminabsprache(orderId: string, duration: string, vehicle: string | null, date: Date, note: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      estimatedDuration: duration,
      vehicle: vehicle === "none" ? null : vehicle,
      kundenTerminStart: date,
      status: OrderStatus.TERMIN_VEREINBART,
      communicationStatus: CommunicationStatus.TERMIN_BESTAETIGT
    }
  });

  // Log history for appointment
  const historyContent = `Termin für ${date.toLocaleDateString('de-DE')} vereinbart.
Geplante Dauer: ${duration}
Fahrzeug: ${vehicle === "none" ? 'Noch offen' : vehicle}`.trim();

  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "SYSTEM",
      content: historyContent
    }
  });

  // Notiz separat speichern, damit xRoute sie findet
  if (note && note.trim() !== "") {
    await prisma.historyEntry.create({
      data: {
        orderId,
        type: "NOTE",
        content: note.trim()
      }
    });
  }

  revalidatePath('/terminabsprachen');
  revalidatePath('/planning');
  revalidatePath('/orders');
  return { success: true };
}

export async function saveTerminNote(orderId: string, note: string) {
  if (!note.trim()) return { success: false };
  
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "NOTE",
      content: note
    }
  });
  
  // Update comm status to reflect we talked but no appointment
  await prisma.order.update({
    where: { id: orderId },
    data: {
      communicationStatus: "Kunde erreicht (Klärung nötig)"
    }
  });

  revalidatePath('/terminabsprachen');
  revalidatePath('/orders');
  return { success: true };
}

export async function logCall(orderId: string) {
  await prisma.historyEntry.create({
    data: {
      orderId,
      type: "CALL",
      content: "Kunde telefonisch erreicht"
    }
  });
  revalidatePath('/terminabsprachen');
}
