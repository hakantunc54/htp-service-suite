const fs = require('fs');
const content = `import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.orderServiceItem.findMany({
    include: {
      serviceItem: true,
      order: { include: { customer: true } }
    },
    where: {
      serviceItem: {
        name: {
          contains: "Abbruch"
        }
      },
      quantity: { gt: 0 }
    }
  });

  let fixed = 0;
  let log = "";
  for (const item of items) {
    if (item.order.status === "Erfolgreich abgeschlossen" || item.order.status === "Neu") {
      await prisma.order.update({
        where: { id: item.orderId },
        data: { status: "Abbruch" }
      });
      fixed++;
      log += \`Korrigiert: \${item.order.customer?.customerName || "Unbekannt"} -> Neuer Status: Abbruch\\n\`;
    }
  }
  
  return new NextResponse(\`Fertig! Es wurden \${fixed} bestehende Auftraege korrigiert.\\n\\n\${log}\`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
`;

fs.writeFileSync('src/app/api/fix-abbruch/route.ts', content, 'utf8');
console.log('Successfully wrote route.ts with utf8 encoding');
