const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const exists = await prisma.serviceItem.findFirst({ where: { name: "DPU Aufbau" } });
  if (!exists) {
    await prisma.serviceItem.create({
      data: {
        name: "DPU Aufbau",
        category: "FTTB",
        defaultPrice: 350,
        description: "Pauschale f\u00fcr DPU Aufbau (Projektnummer als Kundennummer eintragen)"
      }
    });
    console.log("Created DPU Aufbau");
  } else {
    console.log("Already exists");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
