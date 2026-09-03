const fs = require("fs");
let content = fs.readFileSync("src/app/import/actions.ts", "utf8");

content = content.replace(
  /let customer = null;[\s\S]*?if \(custNum\) \{[\s\S]*?customer = await prisma\.customer\.findUnique\(\{ where: \{ customerNumber: custNum \} \}\);[\s\S]*?\}/,
  `let customer = null;
        let pastOrdersStr = "";
        if (custNum) {
          customer = await prisma.customer.findUnique({ where: { customerNumber: custNum } });
        }
        
        if (customer) {
          const pastOrders = await prisma.order.findMany({
            where: { customerId: customer.id, ...(port ? { port: port } : {}) },
            orderBy: { kundenTerminStart: 'desc' }
          });
          
          if (pastOrders.length > 0) {
            const hadAbbruch = pastOrders.some(o => o.status === "Abbruch" || o.status === "Storniert" || (o.technicianRemark && o.technicianRemark.toLowerCase().includes("abbruch")));
            const historyText = pastOrders.map(o => {
               const d = o.kundenTerminStart ? new Date(o.kundenTerminStart).toLocaleDateString("de-DE", {timeZone:"Europe/Berlin"}) : "Unbekannt";
               return \`\${d} (\${o.status})\`;
            }).join(", ");
            
            if (hadAbbruch) {
              pastOrdersStr = \`\\n\\nACHTUNG: Kunde hatte bereits einen ABBRUCH auf diesem Port! Vorherige Termine: \${historyText}. Bitte alte Aktennotizen und Material prüfen!\`;
            } else {
              pastOrdersStr = \`\\n\\nACHTUNG: Kunde/Port war bereits im System! Vorherige Termine: \${historyText}. Bitte alte Aktennotizen prüfen!\`;
            }
          }
        }`
);

content = content.replace(
  /technicianRemark: bem,/g,
  `technicianRemark: bem + pastOrdersStr,`
);

fs.writeFileSync("src/app/import/actions.ts", content);
console.log("Success");
