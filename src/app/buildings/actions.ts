"use server";

import { PrismaClient, BuildingStatus, BuildingTechnology } from '@prisma/client';
import { normalizeAddress, formatObjectNumber } from '@/lib/normalizeAddress';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// ─── Objektliste ───

export async function getBuildings() {
  const buildings = await prisma.building.findMany({
    include: {
      _count: {
        select: {
          entries: true,
          photos: true,
          orders: true,
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return buildings.map(b => ({
    ...b,
    displayNumber: formatObjectNumber(b.objectNumber),
    entryCount: b._count.entries,
    photoCount: b._count.photos,
    orderCount: b._count.orders,
  }));
}

// ─── Einzelnes Objekt ───

export async function getBuildingById(id: string) {
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { createdAt: 'desc' }
      },
      photos: {
        orderBy: { createdAt: 'desc' }
      },
      orders: {
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!building) return null;

  return {
    ...building,
    displayNumber: formatObjectNumber(building.objectNumber),
  };
}

// ─── Objekt anhand Adresse finden ───

export async function findBuildingByAddress(address: string) {
  const parsed = normalizeAddress(address);
  if (!parsed.normalized) return null;

  const building = await prisma.building.findUnique({
    where: { normalizedAddress: parsed.normalized },
    include: {
      _count: {
        select: { entries: true, photos: true }
      }
    }
  });

  if (!building) return null;

  return {
    ...building,
    displayNumber: formatObjectNumber(building.objectNumber),
    entryCount: building._count.entries,
    photoCount: building._count.photos,
  };
}

// ─── Objekt anlegen oder bestehendes zurückgeben ───

export async function createOrGetBuilding(fullAddress: string) {
  const parsed = normalizeAddress(fullAddress);
  if (!parsed.normalized) return null;

  // Prüfen ob Objekt bereits existiert
  const existing = await prisma.building.findUnique({
    where: { normalizedAddress: parsed.normalized }
  });

  if (existing) return existing;

  // Nächste freie Objektnummer ermitteln
  const lastBuilding = await prisma.building.findFirst({
    orderBy: { objectNumber: 'desc' },
    select: { objectNumber: true }
  });
  const nextNumber = (lastBuilding?.objectNumber || 0) + 1;

  // Neues Objekt anlegen
  const building = await prisma.building.create({
    data: {
      street: parsed.street,
      houseNumber: parsed.houseNumber,
      zipCode: parsed.zipCode,
      city: parsed.city,
      normalizedAddress: parsed.normalized,
      objectNumber: nextNumber,
    }
  });

  revalidatePath('/buildings');
  return building;
}

// ─── Manuellen Vermerk hinzufügen ───

export async function addBuildingEntry(
  buildingId: string,
  data: {
    customerName?: string;
    orderType?: string;
    apartmentLocation?: string;
    apartmentCode?: string;
    remark: string;
    orderId?: string;
  }
) {
  const entry = await prisma.buildingEntry.create({
    data: {
      buildingId,
      customerName: data.customerName || null,
      orderType: data.orderType || null,
      apartmentLocation: data.apartmentLocation || null,
      apartmentCode: data.apartmentCode || null,
      remark: data.remark,
      orderId: data.orderId || null,
      isAutomatic: false,
    }
  });

  // lastVisitAt aktualisieren
  await prisma.building.update({
    where: { id: buildingId },
    data: { lastVisitAt: new Date() }
  });

  revalidatePath('/buildings');
  revalidatePath(`/buildings/${buildingId}`);
  return entry;
}

// ─── Automatischer Historien-Eintrag bei Auftragsabschluss ───

export async function addAutoBuildingEntry(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order) return null;

  // Adresse normalisieren und Objekt finden/anlegen
  const building = await createOrGetBuilding(order.customer.address);
  if (!building) return null;

  // Order mit Objekt verknüpfen
  await prisma.order.update({
    where: { id: orderId },
    data: { buildingId: building.id }
  });

  // Automatischen Eintrag erstellen
  const statusText = order.status || "Abgeschlossen";
  const entry = await prisma.buildingEntry.create({
    data: {
      buildingId: building.id,
      orderId: order.id,
      customerName: order.customer.customerName,
      orderType: order.orderType || "Unbekannt",
      apartmentLocation: order.apartmentLocation || null,
      apartmentCode: null, // Wird aus WE-Lage abgeleitet falls vorhanden
      remark: `${statusText}`,
      isAutomatic: true,
    }
  });

  // lastVisitAt aktualisieren
  await prisma.building.update({
    where: { id: building.id },
    data: { lastVisitAt: new Date() }
  });

  revalidatePath('/buildings');
  return { building, entry };
}

// ─── Allgemeine Objektinfos aktualisieren ───

export async function updateBuildingGeneral(
  id: string,
  data: {
    owner?: string;
    propertyManagement?: string;
    caretaker?: string;
    caretakerPhone?: string;
    contactPerson?: string;
    contactPhone?: string;
    primaryContact?: string;
    primaryContactPhone?: string;
    primaryContactRole?: string;
  }
) {
  await prisma.building.update({
    where: { id },
    data
  });

  revalidatePath(`/buildings/${id}`);
  revalidatePath('/buildings');
  return { success: true };
}

// ─── Technische Infos aktualisieren ───

export async function updateBuildingTech(
  id: string,
  data: {
    dpuLocation?: string;
    dpuSiteCode?: string;
    dpuIpAddress?: string;
    dpuManufacturer?: string;
    dpuSerialNumber?: string;
    dpuCount?: number;
    dslamLocation?: string;
    fiberHandoverPoint?: string;
    aplLocation?: string;
    lsaLocation?: string;
    cablingNotes?: string;
    techRoomAccess?: string;
    keyInfo?: string;
    unitCount?: number;
    technology?: BuildingTechnology | null;
  }
) {
  await prisma.building.update({
    where: { id },
    data
  });

  revalidatePath(`/buildings/${id}`);
  revalidatePath('/buildings');
  return { success: true };
}

// ─── Objektstatus (Ampel) setzen ───

export async function updateBuildingStatus(
  id: string,
  status: BuildingStatus,
  note?: string
) {
  await prisma.building.update({
    where: { id },
    data: {
      objectStatus: status,
      objectStatusNote: note || null,
    }
  });

  revalidatePath(`/buildings/${id}`);
  revalidatePath('/buildings');
  return { success: true };
}

// ─── Objektnotizen speichern ───

export async function updateBuildingNotes(id: string, notes: string) {
  await prisma.building.update({
    where: { id },
    data: { notes }
  });

  revalidatePath(`/buildings/${id}`);
  return { success: true };
}

// ─── Favorit togglen ───

export async function toggleBuildingFavorite(id: string) {
  const building = await prisma.building.findUnique({ where: { id } });
  if (!building) return { success: false };

  await prisma.building.update({
    where: { id },
    data: { isFavorite: !building.isFavorite }
  });

  revalidatePath(`/buildings/${id}`);
  revalidatePath('/buildings');
  return { success: true, isFavorite: !building.isFavorite };
}

// ─── Foto-Metadaten speichern ───

export async function saveBuildingPhotoMeta(
  buildingId: string,
  filename: string,
  caption?: string,
  category?: string,
  fileSize?: number
) {
  const photo = await prisma.buildingPhoto.create({
    data: {
      buildingId,
      filename,
      caption: caption || null,
      category: (category as any) || null,
      fileSize: fileSize || null,
    }
  });

  revalidatePath(`/buildings/${buildingId}`);
  return photo;
}

// ─── Foto-Metadaten löschen ───

export async function deleteBuildingPhotoMeta(photoId: string) {
  const photo = await prisma.buildingPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return { success: false, filename: null };

  await prisma.buildingPhoto.delete({ where: { id: photoId } });

  revalidatePath(`/buildings/${photo.buildingId}`);
  return { success: true, filename: photo.filename };
}
