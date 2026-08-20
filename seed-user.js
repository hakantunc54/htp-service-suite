const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seed() {
  const hash = await bcrypt.hash('htp2026!', 10);
  
  await prisma.user.upsert({
    where: { email: 'hakan@tunc.de' },
    update: {},
    create: {
      name: 'Hakan Tunç',
      email: 'hakan@tunc.de',
      password: hash,
      role: 'ADMIN'
    }
  });
  
  console.log("Benutzer Hakan Tunç wurde in die DB eingetragen!");
}

seed().finally(() => prisma.$disconnect());
