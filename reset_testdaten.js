const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Starte Datenbank-Reset (Testdaten werden gelöscht)...");
  
  // Lösche in der richtigen Reihenfolge (wegen Foreign Keys)
  await prisma.historyEntry.deleteMany();
  await prisma.orderServiceItem.deleteMany();
  await prisma.bdeDetails.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  
  console.log("✅ Alle Kunden, Aufträge, Historien und Abrechnungen wurden gelöscht.");
  console.log("✅ Service-Katalog und Preisliste bleiben erhalten.");
}

run().finally(() => prisma.$disconnect());
