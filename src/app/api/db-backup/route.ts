
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  
  let dbPath = "/data/dev.db";
  if (!fs.existsSync(dbPath)) {
    // Fallback for local development
    dbPath = path.join(process.cwd(), "htp-data", "dev.db");
  }

  if (!fs.existsSync(dbPath)) return new NextResponse("Database file not found", { status: 404 });
  
  const fileBuffer = fs.readFileSync(dbPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": `attachment; filename="htp_suite_backup_${new Date().toISOString().split('T')[0]}.db"`
    }
  });
}
