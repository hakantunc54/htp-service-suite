const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const oldCode = `        if (orderData.isTerminabsprache) {
          await prisma.historyEntry.create({
            data: {
              orderId: newOrder.id,
              type: "SYSTEM",
              content: "Terminabsprachen-Auftrag importiert"
            }
          });
        }`;

const newCode = `        // Always create a system history entry logging the port and address at import time
        const baseMsg = orderData.isTerminabsprache 
          ? "Terminabsprachen-Auftrag importiert." 
          : \`Auftrag via Smart Import angelegt. Servicefenster: \${orderData.htpPlanfenster || "Keines"}\`;
        
        await prisma.historyEntry.create({
          data: {
            orderId: newOrder.id,
            type: "SYSTEM",
            content: \`\${baseMsg}\\nAnschlussadresse: \${orderData.address || "Unbekannt"}\\nPort/Netzelement: \${orderData.port || "Fehlt"}\`
          }
        });`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
