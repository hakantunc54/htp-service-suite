import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { port } = body;

    const order = await prisma.order.update({
      where: { id },
      data: { port: port || "" }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
