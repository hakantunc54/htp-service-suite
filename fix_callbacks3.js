const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const match = code.match(/const callbacksToday = await prisma\.order\.count\([\s\S]*?\}\);\s*const appointmentsToday/);

if (match) {
  const newLogic = `
  // Hole alle potenziellen Rückrufe und filtere FTTB hart in JavaScript heraus
  const rawCallbacks = await prisma.order.findMany({
    where: {
      OR: [
        { status: "Neu" },
        { status: "Kunde nicht erreicht" },
        { status: "Kunde hat zurückgerufen" },
        { status: "Kunde hat zurOckgerufen" }
      ],
      communicationStatus: { notIn: ["Termin bestätigt", "Termin besttigt"] }
    },
    select: { orderType: true, vosNumber: true, status: true, kundenTerminStart: true }
  });

  const callbacksToday = rawCallbacks.filter(o => {
    // Wenn es ein echter eingestellter FTTB (ohne vosNumber und ohne "BDE" im Namen) ist, komplett ignorieren!
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || 
                  (o.orderType || "").toLowerCase().includes("endleitung") || 
                  o.vosNumber;
                  
    // FTTB ignorieren, wir zählen nur BDEs!
    if (!isBDE) return false;
    
    // Bei BDEs: Zählen, wenn Termin fehlt ODER Kunde explizit auf Rückruf steht
    if (o.status === "Neu" && o.kundenTerminStart !== null) return false; 
    
    return true;
  }).length;

  const appointmentsToday`;
  
  code = code.replace(match[0], newLogic);
  fs.writeFileSync('src/app/page.tsx', code, 'utf8');
  console.log("Success");
} else {
  console.log("Regex failed");
}
