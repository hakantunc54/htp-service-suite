const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starte Datenbank-Reparatur...");
  
  await prisma.serviceItem.updateMany({
    where: { name: 'Anfahrt <12 km' },
    data: { name: 'Anfahrt <12' }
  });
  await prisma.serviceItem.updateMany({
    where: { name: 'Anfahrt >12 km' },
    data: { name: 'Anfahrt >12' }
  });
  console.log("Service-Item Namen korrigiert.");

  const allOrders = await prisma.order.findMany({
    include: { services: { include: { serviceItem: true } } }
  });
  
  let reverted = 0;
  for (let o of allOrders) {
    const hasBdeItems = o.services.some(s => s.serviceItem.name.includes('Arbeitszeit') || s.serviceItem.name === 'Material (BDE)');
    if (!hasBdeItems && o.orderType && o.orderType.includes('BdE')) {
      await prisma.order.update({
        where: { id: o.id },
        data: { orderType: 'FTTB Bereitstellung' }
      });
      reverted++;
    }
  }
  console.log(reverted + " faelschlicherweise als BDE markierte Auftraege repariert.");

  const completedOrders = await prisma.order.findMany({
    where: { status: 'Erfolgreich abgeschlossen' },
    include: { services: { include: { serviceItem: true } } }
  });
  
  let updatedValues = 0;
  for (let o of completedOrders) {
    let total = 0;
    for (let s of o.services) {
      let price = s.priceApplied;
      // Falls der Preis 0 ist, weil der Import kaputt war, nimm den Default Preis
      if (!price || price === 0) {
         price = s.serviceItem.defaultPrice || 0;
         await prisma.orderServiceItem.update({
           where: { id: s.id },
           data: { priceApplied: price }
         });
      }
      total += price * s.quantity;
    }
    
    await prisma.order.update({
      where: { id: o.id },
      data: { orderValue: total }
    });
    updatedValues++;
  }
  console.log(updatedValues + " Auftragssummen (Umsaetze) neu berechnet.");
}

main().catch(console.error);
