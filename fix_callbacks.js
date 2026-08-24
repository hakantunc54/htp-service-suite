const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldQuery = `const callbacksToday = await prisma.order.count({
    where: {
      status: { in: ["Kunde nicht erreicht", "Kunde hat zurOckgerufen", "Neu"] },
      communicationStatus: { notIn: ["Termin besttigt"] }
    }
  });`;

const newQuery = `const callbacksToday = await prisma.order.count({
    where: {
      OR: [
        { status: "Neu", kundenTerminStart: null },
        { status: "Kunde nicht erreicht" },
        { status: "Kunde hat zurückgerufen" },
        { status: "Kunde hat zurOckgerufen" } // fallback for bad encoding
      ],
      communicationStatus: { notIn: ["Termin bestätigt", "Termin besttigt"] }
    }
  });`;

code = code.replace(oldQuery, newQuery);

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
