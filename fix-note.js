const fs = require("fs");
let content = fs.readFileSync("src/app/terminabsprachen/actions.ts", "utf8");

content = content.replace(
  `// Update comm status to reflect we talked but no appointment
  await prisma.order.update({
    where: { id: orderId },
    data: {
      communicationStatus: "Kunde erreicht (Klärung nötig)"
    }
  });`,
  `// Update comm status to reflect we talked but no appointment
  // IMPORTANT: Keep status as "Termin abstimmen" so the order stays in Terminabsprachen
  // and does NOT appear in Disposition (which excludes "Termin abstimmen")
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "Termin abstimmen",
      communicationStatus: "Kunde erreicht (Klärung nötig)"
    }
  });`
);

fs.writeFileSync("src/app/terminabsprachen/actions.ts", content, "utf8");
console.log("Fixed saveTerminNote");
