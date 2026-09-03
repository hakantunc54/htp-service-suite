const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// Find the prisma.order.create for historical data
const oldBlock = `      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderType,
          status: "Erfolgreich abgeschlossen",
          communicationStatus: "NOCH_NICHT",
          kundenTerminStart: termin,
          vehicle,
          port,
          technicianRemark: bem,
          apartmentLocation: weLage,
          isBilled: true,
          orderValue: 0 // Wird gleich berechnet
        }
      });`;

const newBlock = `      // Wir schauen, ob es irgendwelche Leistungs-Werte in der Zeile gibt
      let hasBillingItems = false;
      for (const [colName, val] of Object.entries(row)) {
        if (columnMap[colName] && Number(val) > 0) hasBillingItems = true;
      }

      // Wenn Leistungen da sind -> Abgeschlossen. Wenn nicht -> Termin vereinbart (bereit zur Abrechnung!)
      const initialStatus = hasBillingItems ? "Erfolgreich abgeschlossen" : "Termin vereinbart";
      const initialBilled = hasBillingItems;

      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          orderType,
          status: initialStatus,
          communicationStatus: "NOCH_NICHT",
          kundenTerminStart: termin,
          vehicle,
          port,
          technicianRemark: bem,
          apartmentLocation: weLage,
          isBilled: initialBilled,
          orderValue: 0 // Wird gleich berechnet
        }
      });`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
console.log("Updated historical import logic");
