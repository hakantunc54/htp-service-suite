import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "Entrup";
  
  const custs = await prisma.customer.findMany({
    where: { customerName: { contains: q } },
    include: { orders: { include: { services: { include: { serviceItem: true } } } } }
  });
  
  return NextResponse.json(custs);
}
