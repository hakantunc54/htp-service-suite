
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    if (formData.get("confirm_text") !== "LOESCHEN") {
      return new NextResponse("Falscher Bestaetigungstext.", { status: 400 });
    }

    await prisma.historyEntry.deleteMany({});
    await prisma.orderServiceItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.customer.deleteMany({});

    return new NextResponse(`
      <html><body>
      <h1 style="color:red;">Datenbank erfolgreich geloescht!</h1>
      <p>Alle Auftraege und Kunden wurden entfernt. Du hast jetzt ein leeres System (Preise blieben erhalten).</p>
      <a href="/">Zum Dashboard</a>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  } catch(e) {
    return new NextResponse("Error: " + e, { status: 500 });
  }
}
