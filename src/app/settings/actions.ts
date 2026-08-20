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
