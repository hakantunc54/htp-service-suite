"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getSettingsData() {
  const serviceItems = await prisma.serviceItem.findMany({ orderBy: { name: "asc" } });
  const smsTemplates = await prisma.smsTemplate.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true, role: true } });
  
  return { serviceItems, smsTemplates, users };
}

export async function updateServiceItemPrice(id: string, newPrice: number) {
  try {
    await prisma.serviceItem.update({
      where: { id },
      data: { defaultPrice: newPrice }
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updateSmsTemplate(id: string, content: string) {
  try {
    await prisma.smsTemplate.update({
      where: { id },
      data: { content }
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}


import bcrypt from "bcrypt";
export async function updatePassword(userId: string, newPassword: string) {
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hash }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}


export async function wipeDatabase() {
  await prisma.historyEntry.deleteMany({});
  await prisma.orderServiceItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  return { success: true };
}

export async function restoreDatabase(formData: FormData) {
  const file = formData.get("db_file") as File;
  if (!file) return { success: false, error: "Keine Datei gefunden." };
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const fs = require('fs');
  const path = require('path');
  
  let dbPath = "/data/dev.db";
  if (!fs.existsSync(dbPath)) {
    dbPath = path.join(process.cwd(), "htp-data", "dev.db");
  }
  
  fs.writeFileSync(dbPath, buffer);
  return { success: true };
}
