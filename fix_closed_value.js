const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

code = code.replace(
  `const openValue = financialData._sum.orderValue || 0;
  const closedValue = billedData._sum.orderValue || 0;`,
  `const openValue = financialData._sum.orderValue || 0;
  let closedValue = billedData._sum.orderValue || 0;`
);

const oldAnfahrtLogic = `// Apply FTTB Anfahrt
  Object.values(anfahrtGroups.FTTB).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      const anfahrtPreis = group.count >= 12 ? 50 : 35;
      chartDataMap[key]["FTTB"] += anfahrtPreis;
    }
  });

  // Apply BDE Anfahrt
  Object.values(anfahrtGroups.BDE).forEach(group => {
    const key = \`\${group.year}-\${group.month}\`;
    if (group.count > 0) {
      chartDataMap[key]["BDE"] += 60; // BDE pauschal 60 EUR
    }
  });`;

const newAnfahrtLogic = `// Apply FTTB Anfahrt
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

code = code.replace(oldAnfahrtLogic, newAnfahrtLogic);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
