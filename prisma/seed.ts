import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Seed SMS Templates
  const templates = [
    {
      name: 'Erstkontakt',
      content: 'Guten Morgen Frau/Herr {name},\n\nwir haben von htp den Auftrag erhalten, die Störung Ihres Internetanschlusses zu prüfen.\n\nBitte rufen Sie uns zur Terminvereinbarung unter 0511/72716969 zurück.\n\nFreundliche Grüße\nIhr htp Service-Partner\nHakan Tunç'
    },
    {
      name: 'Erinnerung',
      content: 'Guten Morgen Frau/Herr {name},\n\nwir konnten Sie bisher leider nicht erreichen.\n\nBitte melden Sie sich unter 0511/72716969 zur Terminvereinbarung.\n\nFreundliche Grüße\nIhr htp Service-Partner\nHakan Tunç'
    },
    {
      name: 'Letzte Erinnerung',
      content: 'Guten Morgen Frau/Herr {name},\n\ntrotz mehrerer Kontaktversuche konnten wir bisher keinen Termin abstimmen.\n\nBitte melden Sie sich zeitnah unter 0511/72716969.\n\nAndernfalls müssen wir den Vorgang an htp mit dem Hinweis \'Kunde nicht erreichbar\' zurückmelden.\n\nFreundliche Grüße\nIhr htp Service-Partner\nHakan Tunç'
    }
  ]

  for (const t of templates) {
    await prisma.smsTemplate.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    })
  }

  // Seed ServiceItems (Leistungskatalog)
  const serviceItems = [
    { name: 'FTTB', defaultPrice: 65.0 },
    { name: 'Abbruch', defaultPrice: 30.0 },
    { name: 'Anfahrt >12 km', defaultPrice: 15.0 },
    { name: 'Anfahrt <12 km', defaultPrice: 10.0 },
    { name: 'MAW', defaultPrice: 20.0 },
    { name: 'PCI', defaultPrice: 25.0 },
    { name: 'vLauiAPLe', defaultPrice: 40.0 },
    { name: 'Warten 5 Min', defaultPrice: 5.0 },
    { name: 'Warten 10 Min', defaultPrice: 10.0 },
    { name: 'fZugang DPU/APL', defaultPrice: 15.0 },
    { name: 'KvHdF', defaultPrice: 12.0 },
    { name: 'Dispo', defaultPrice: 8.0 }
  ]

  for (const item of serviceItems) {
    await prisma.serviceItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
