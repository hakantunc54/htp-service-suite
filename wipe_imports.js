const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Loesche alle bisher importierten historischen Auftraege...");
  
  // Wir loeschen nur Auftraege, die als "Erfolgreich abgeschlossen" und isBilled=true markiert sind
  // Das sind die, die ueber den Excel-Import reinkamen.
  const res = await prisma.order.deleteMany({
    where: { 
      status: 'Erfolgreich abgeschlossen',
      isBilled: true
    }
  });
  
  console.log(`${res.count} importierte Auftraege wurden geloescht! Du kannst die Excel-Tabellen jetzt neu hochladen.`);
}

main().catch(console.error);
