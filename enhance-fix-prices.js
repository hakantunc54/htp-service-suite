const fs = require('fs');
let content = fs.readFileSync('src/app/api/fix-prices/route.ts', 'utf8');

const additionalPass = `
  // Pass 2: Verify and fix orderValue for all orders
  const allOrders = await prisma.order.findMany({
    include: { services: true, customer: true }
  });
  
  for (const order of allOrders) {
    const calculatedTotal = order.services.reduce((sum, s) => sum + (s.priceApplied || 0), 0);
    if (order.orderValue !== calculatedTotal) {
      log += \`Fixed Order Total for \${order.customer?.customerName || 'Unknown'}: old total \${order.orderValue} EUR -> new total \${calculatedTotal} EUR\\n\`;
      await prisma.order.update({
        where: { id: order.id },
        data: { orderValue: calculatedTotal }
      });
      fixedCount++;
    }
  }
`;

content = content.replace(/if \(fixedCount === 0\) \{/, additionalPass + '\n  if (fixedCount === 0) {');

fs.writeFileSync('src/app/api/fix-prices/route.ts', content, 'utf8');
console.log("Enhanced fix-prices with Pass 2.");
