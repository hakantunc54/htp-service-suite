const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const regex = /export async function saveImportedOrders\(orders: ParsedOrder\[\]\) \{/m;
const newRegex = `export async function saveImportedOrders(orders: ParsedOrder[], targetDateStr?: string) {`;
code = code.replace(regex, newRegex);

const orderCreateRegex = /const newOrder = await prisma\.order\.create\(\{[\s\S]*?status: orderData\.isTerminabsprache \? OrderStatus\.TERMIN_ABSTIMMEN : OrderStatus\.NEU,\s*communicationStatus: orderData\.isTerminabsprache \? CommunicationStatus\.NOCH_NICHT_KONTAKTIERT : CommunicationStatus\.NOCH_NICHT,\s*vosNumber/m;

const newOrderCreate = `// Compute the initial termin based on targetDate
        let termin = null;
        if (targetDateStr) {
          const baseDate = new Date(targetDateStr);
          // Try to extract hour from htpPlanfenster (e.g. "08:00 - 17:00")
          if (orderData.htpPlanfenster) {
            const timeMatch = orderData.htpPlanfenster.match(/(\\d{1,2}):(\\d{2})/);
            if (timeMatch) {
              baseDate.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
            }
          }
          termin = baseDate;
        }

        const newOrder = await prisma.order.create({
          data: {
            customerId: customer.id,
            htpPlanfenster: orderData.htpPlanfenster,
            orderType: orderData.orderType,
            status: targetDateStr ? OrderStatus.TERMIN_VEREINBART : (orderData.isTerminabsprache ? OrderStatus.TERMIN_ABSTIMMEN : OrderStatus.NEU),
            communicationStatus: targetDateStr ? CommunicationStatus.TERMIN_BESTAETIGT : (orderData.isTerminabsprache ? CommunicationStatus.NOCH_NICHT_KONTAKTIERT : CommunicationStatus.NOCH_NICHT),
            kundenTerminStart: termin,
            vosNumber`;
code = code.replace(orderCreateRegex, newOrderCreate);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
console.log("Updated saveImportedOrders");
