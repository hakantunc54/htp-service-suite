const fs = require('fs');

fs.mkdirSync('src/app/api/db-backup', { recursive: true });
fs.writeFileSync('src/app/api/db-backup/route.ts', `
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dbPath = path.join(process.cwd(), "htp-data", "dev.db");
  if (!fs.existsSync(dbPath)) return new NextResponse("Database file not found", { status: 404 });
  
  const fileBuffer = fs.readFileSync(dbPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": \`attachment; filename="htp_suite_backup_\${new Date().toISOString().split('T')[0]}.db"\`
    }
  });
}
`, 'utf8');

fs.mkdirSync('src/app/api/db-restore', { recursive: true });
fs.writeFileSync('src/app/api/db-restore/route.ts', `
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("db_file") as File;
    if (!file) return new NextResponse("No file uploaded", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const dbPath = path.join(process.cwd(), "htp-data", "dev.db");
    fs.writeFileSync(dbPath, buffer);

    return new NextResponse(\`
      <html><body>
      <h1 style="color:green;">Backup erfolgreich wiederhergestellt!</h1>
      <p>Die Datenbank wurde ueberschrieben.</p>
      <p><b>WICHTIG:</b> Starte jetzt den Container neu (<code>docker compose restart</code>), damit Prisma die neue Datenbank einliest!</p>
      <a href="/settings">Zurueck zu den Einstellungen</a>
      </body></html>
    \`, { headers: { "Content-Type": "text/html" } });
  } catch(e) {
    return new NextResponse("Error: " + e, { status: 500 });
  }
}
`, 'utf8');

fs.mkdirSync('src/app/api/db-wipe', { recursive: true });
fs.writeFileSync('src/app/api/db-wipe/route.ts', `
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

    return new NextResponse(\`
      <html><body>
      <h1 style="color:red;">Datenbank erfolgreich geloescht!</h1>
      <p>Alle Auftraege und Kunden wurden entfernt. Du hast jetzt ein leeres System (Preise blieben erhalten).</p>
      <a href="/">Zum Dashboard</a>
      </body></html>
    \`, { headers: { "Content-Type": "text/html" } });
  } catch(e) {
    return new NextResponse("Error: " + e, { status: 500 });
  }
}
`, 'utf8');

console.log("APIs created.");
