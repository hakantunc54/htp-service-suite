const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const regex = /if\s*\(orderData\.isTerminabsprache\)\s*\{\s*await\s*prisma\.historyEntry\.create\(\{\s*data:\s*\{\s*orderId:\s*newOrder\.id,\s*type:\s*"SYSTEM",\s*content:\s*"Terminabsprachen-Auftrag\s*importiert"\s*\}\s*\}\);\s*\}/g;

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

code = code.replace(regex, newCode);
fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
console.log("Replaced:", regex.test(fs.readFileSync('src/app/import/actions.ts', 'utf8')) ? "No" : "Yes");
