const fs = require('fs');

let content = fs.readFileSync('src/app/settings/actions.ts', 'utf8');

const newActions = `
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
`;

content += '\n' + newActions;
fs.writeFileSync('src/app/settings/actions.ts', content, 'utf8');

// Also create a restart endpoint
fs.mkdirSync('src/app/api/restart', { recursive: true });
fs.writeFileSync('src/app/api/restart/route.ts', `
import { NextResponse } from "next/server";

export async function POST() {
  // Wait 1 second to allow the response to reach the client, then kill the process
  setTimeout(() => {
    console.log("Programmatic restart requested. Exiting process...");
    process.exit(0);
  }, 1000);
  
  return NextResponse.json({ success: true, message: "Server restarts in 1 second" });
}
`, 'utf8');

console.log("Actions and restart endpoint added.");
