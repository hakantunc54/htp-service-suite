
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
    
    
  let dbPath = "/data/dev.db";
  if (!fs.existsSync(dbPath)) {
    // Fallback for local development
    dbPath = path.join(process.cwd(), "htp-data", "dev.db");
  }

    fs.writeFileSync(dbPath, buffer);

    return new NextResponse(`
      <html><body>
      <h1 style="color:green;">Backup erfolgreich wiederhergestellt!</h1>
      <p>Die Datenbank wurde ueberschrieben.</p>
      <p><b>WICHTIG:</b> Starte jetzt den Container neu (<code>docker compose restart</code>), damit Prisma die neue Datenbank einliest!</p>
      <a href="/settings">Zurueck zu den Einstellungen</a>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } });
  } catch(e) {
    return new NextResponse("Error: " + e, { status: 500 });
  }
}
