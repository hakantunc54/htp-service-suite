const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const match = code.match(/const callbacksToday = await prisma\.order\.count\(\{\s*where:\s*\{\s*status:\s*\{[^}]*\}\s*,\s*communicationStatus:\s*\{[^}]*\}\s*\}\s*\}\);/);

if (match) {
  const newQuery = `const callbacksToday = await prisma.order.count({
    where: {
      OR: [
        { status: "Neu", kundenTerminStart: null },
        { status: "Kunde nicht erreicht" },
        { status: "Kunde hat zurückgerufen" },
        { status: "Kunde hat zurOckgerufen" }
      ],
      communicationStatus: { notIn: ["Termin bestätigt", "Termin besttigt"] }
    }
  });`;
  
  code = code.replace(match[0], newQuery);
  fs.writeFileSync('src/app/page.tsx', code, 'utf8');
  console.log("Success");
} else {
  console.log("Regex failed");
}
