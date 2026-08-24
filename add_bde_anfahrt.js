const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.serviceItem.findFirst({
    where: { name: 'Anfahrt (BDE)' }
  });
  
  if (!existing) {
    await prisma.serviceItem.create({
      data: {
        name: 'Anfahrt (BDE)',
        description: 'Anfahrt fuer BDE Auftraege',
        defaultPrice: 60,
        category: 'BDE'
      }
    });
    console.log('Anfahrt (BDE) erfolgreich zur Datenbank hinzugefuegt!');
  } else {
    console.log('Anfahrt (BDE) existiert bereits.');
  }
}

main().catch(console.error);
