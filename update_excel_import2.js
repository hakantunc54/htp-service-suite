const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const regex = /const order = await prisma\.order\.create\(\{\s*data:\s*\{\s*customerId:\s*customer\.id,\s*orderType,\s*status:\s*"Erfolgreich abgeschlossen",\s*communicationStatus:\s*"NOCH_NICHT",\s*kundenTerminStart:\s*termin,\s*vehicle,\s*port,\s*technicianRemark:\s*bem,\s*apartmentLocation:\s*weLage,\s*isBilled:\s*true,\s*orderValue:\s*0[^\}]*\}\s*\}\);/m;

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
          orderValue: 0
        }
      });`;

code = code.replace(regex, newBlock);
fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
console.log("Did replace:", regex.test(fs.readFileSync('src/app/import/actions.ts', 'utf8')) ? "No" : "Yes");
