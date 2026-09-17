const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const oldLogic = `            if (qty > 0) {
              let priceToApply = 0;
              if (si.name === "Material (BDE)") priceToApply = Number(row.materialPrice || 0);
              else if (si.name === "Optional (BDE)") priceToApply = Number(row.optionalPrice || 0);
              else priceToApply = Number(si.defaultPrice || 0);
              
              await prisma.orderServiceItem.create({
                data: {
                  orderId: order.id,
                  serviceItemId: si.id,
                  quantity: qty,
                  priceApplied: priceToApply
                }
              });

              totalValue += priceToApply;
            }`;

const newLogic = `            if (qty > 0) {
              let priceToApply = 0;
              if (si.name === "Material (BDE)") priceToApply = Number(row.materialPrice || 0);
              else if (si.name === "Optional (BDE)") priceToApply = Number(row.optionalPrice || 0);
              else priceToApply = Number(si.defaultPrice || 0);
              
              const rowTotal = priceToApply * qty;
              
              await prisma.orderServiceItem.create({
                data: {
                  orderId: order.id,
                  serviceItemId: si.id,
                  quantity: qty,
                  priceApplied: rowTotal
                }
              });

              totalValue += rowTotal;
            }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log("Import logic fixed.");
