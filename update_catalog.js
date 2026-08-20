const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const items = [
    // FTTB
    { name: "FTTB", category: "FTTB", defaultPrice: 38.0 },
    { name: "Abbruch", category: "FTTB", defaultPrice: 20.0 },
    { name: "MAW (5Min)", category: "FTTB", defaultPrice: 4.5 },
    { name: "PCI", category: "FTTB", defaultPrice: 20.0 },
    { name: "vLauiAPLe", category: "FTTB", defaultPrice: 15.0 },
    { name: "Warten 5Min", category: "FTTB", defaultPrice: 4.5 },
    { name: "Warten 10Min", category: "FTTB", defaultPrice: 8.0 },
    { name: "fZugang DPU/APL", category: "FTTB", defaultPrice: 13.0 },
    { name: "KvHdF", category: "FTTB", defaultPrice: 15.0 },
    { name: "Optional / Material (FTTB)", category: "FTTB", defaultPrice: 1.0 },

    // BDE
    { name: "Arbeitszeit (Std.)", category: "BDE", defaultPrice: 45.0 },
    { name: "Anfahrt", category: "BDE", defaultPrice: 60.0 },
    { name: "Material (BDE)", category: "BDE", defaultPrice: 1.0 },
    { name: "Optional (BDE)", category: "BDE", defaultPrice: 1.0 }
  ];
  
  for(let i of items) {
    await prisma.serviceItem.upsert({
      where: { name: i.name },
      update: { defaultPrice: i.defaultPrice, category: i.category },
      create: i
    });
  }
  console.log("Updated service catalog with categories");
}

run().finally(() => prisma.$disconnect());
