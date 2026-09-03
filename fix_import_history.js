const fs = require("fs");
let content = fs.readFileSync("src/app/import/actions.ts", "utf8");

const oldCode = `      for (const orderData of orders) {
        // Create or find customer
        let customer = await prisma.customer.findUnique({
          where: { customerNumber: orderData.customerNumber || "N/A" }
        });`;

const newCode = `      for (const orderData of orders) {
        // Create or find customer
        let pastOrdersStr = "";
        let customer = await prisma.customer.findUnique({
          where: { customerNumber: orderData.customerNumber || "N/A" }
        });
        
        if (customer) {
          const pastOrders = await prisma.order.findMany({
            where: { 
              customerId: customer.id,
              ...(orderData.port ? { port: orderData.port } : {})
            },
            orderBy: { kundenTerminStart: 'desc' }
          });
          
          if (pastOrders.length > 0) {
            const hadAbbruch = pastOrders.some(o => o.status === "Abbruch" || o.status === "Storniert" || (o.technicianRemark && o.technicianRemark.toLowerCase().includes("abbruch")));
            const historyText = pastOrders.map(o => {
               const d = o.kundenTerminStart ? new Date(o.kundenTerminStart).toLocaleDateString("de-DE", {timeZone:"Europe/Berlin"}) : "Unbekannt";
               return \`\${d} (\${o.status})\`;
            }).join(", ");
            
            if (hadAbbruch) {
              pastOrdersStr = \`ACHTUNG: Kunde hatte bereits einen ABBRUCH auf diesem Port! Vorherige Termine: \${historyText}. Bitte alte Aktennotizen und Material prüfen!\`;
            } else {
              pastOrdersStr = \`ACHTUNG: Kunde/Port war bereits im System! Vorherige Termine: \${historyText}. Bitte alte Aktennotizen prüfen!\`;
            }
          }
        }`;

content = content.replace(oldCode, newCode);

const oldCode2 = `            port: orderData.port,
          }
        });`;

const newCode2 = `            port: orderData.port,
            technicianRemark: pastOrdersStr || undefined,
          }
        });`;

content = content.replace(oldCode2, newCode2);

fs.writeFileSync("src/app/import/actions.ts", content);
console.log("Success");
