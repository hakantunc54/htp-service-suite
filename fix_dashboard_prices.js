const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldAnfahrtLogic = `// Apply FTTB Anfahrt
  Object.values(anfahrtGroups.FTTB).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      const anfahrtPreis = group.count >= 12 ? 50 : 35;
      chartDataMap[key]["FTTB"] += anfahrtPreis;
      closedValue += anfahrtPreis;
    }
  });

  // Apply BDE Anfahrt
  Object.values(anfahrtGroups.BDE).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      chartDataMap[key]["BDE"] += 60; // BDE pauschal 60 EUR
      closedValue += 60;
    }
  });`;

const newAnfahrtLogic = `// Fetch dynamic prices for Anfahrt
  const serviceItems = await prisma.serviceItem.findMany({
    where: { name: { contains: "Anfahrt" } }
  });
  
  const priceFttbLt12 = serviceItems.find(i => i.name.includes("<12"))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes(">12"))?.defaultPrice || 50;
  const priceBde = serviceItems.find(i => i.name.includes("BDE") || i.name.includes("BdE"))?.defaultPrice || 60;

  // Apply FTTB Anfahrt
  Object.values(anfahrtGroups.FTTB).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      const anfahrtPreis = group.count >= 12 ? priceFttbGt12 : priceFttbLt12;
      chartDataMap[key]["FTTB"] += anfahrtPreis;
      closedValue += anfahrtPreis;
    }
  });

  // Apply BDE Anfahrt
  Object.values(anfahrtGroups.BDE).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      chartDataMap[key]["BDE"] += priceBde;
      closedValue += priceBde;
    }
  });`;

code = code.replace(oldAnfahrtLogic, newAnfahrtLogic);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
