const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

const regex = /let priceToApply = 0;\s*if \(si\.name === "Material \(BDE\)"\) priceToApply = Number\(row\.materialPrice \|\| 0\);\s*else if \(si\.name === "Optional \(BDE\)"\) priceToApply = Number\(row\.optionalPrice \|\| 0\);\s*else priceToApply = Number\(si\.defaultPrice \|\| 0\);\s*await prisma\.orderServiceItem\.create\(\{\s*data: \{\s*orderId: order\.id,\s*serviceItemId: si\.id,\s*quantity: qty,\s*priceApplied: priceToApply\s*\}\s*\}\);\s*totalValue \+= priceToApply;/g;

const newLogic = `let priceToApply = 0;
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

              totalValue += rowTotal;`;

content = content.replace(regex, newLogic);
fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log("Import logic fixed with regex.");
