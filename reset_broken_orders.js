const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.order.updateMany({
    where: {
      status: "Termin vereinbart",
      kundenTerminStart: null
    },
    data: {
      status: "Termin abstimmen",
      communicationStatus: "Kunde erreicht"
    }
  });
  console.log("Updated orders:", result.count);
}

run().finally(() => prisma.$disconnect());
