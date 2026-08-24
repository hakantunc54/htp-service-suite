const fs = require('fs');

const code = `import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { address, phone, orderId } = body;

    const oldCustomer = await prisma.customer.findUnique({ where: { id } });
    
    if (!oldCustomer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { address, phone }
    });

    // Generate history entries if things changed
    let changes = [];
    if (oldCustomer.address !== address) {
      changes.push(\`Adresse geändert von "\${oldCustomer.address}" zu "\${address}"\`);
    }
    if (oldCustomer.phone !== phone) {
      changes.push(\`Telefonnummer geändert von "\${oldCustomer.phone}" zu "\${phone}"\`);
    }

    if (changes.length > 0 && orderId) {
      await prisma.historyEntry.create({
        data: {
          orderId,
          type: "SYSTEM",
          content: "Stammdaten aktualisiert:\\n" + changes.join("\\n")
        }
      });
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}`;

fs.writeFileSync('src/app/api/customer/[id]/route.ts', code, 'utf8');
