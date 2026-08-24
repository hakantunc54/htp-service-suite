const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add vehicle to select
code = code.replace(
  `select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true }`,
  `select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true, vehicle: true }`
);

// 2. Replace the mapping loop
const oldLoop = `const chartDataMap: Record<string, any> = {};
  
  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = \`\${year}-\${month}\`;
    
    if (!chartDataMap[key]) {
      chartDataMap[key] = { year, month, monthName: monthNames[month], FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
      const type = isBDE ? "BDE" : "FTTB";
    chartDataMap[key][type] += val;
  });`;

const newLoop = `const chartDataMap: Record<string, any> = {};
  
  // Track Anfahrten grouped by Date+Vehicle+Type
  const anfahrtGroups = {
    FTTB: {}, // key: "YYYY-MM-DD_Vehicle" => { year, month, count: number }
    BDE: {}   // key: "YYYY-MM-DD_Vehicle" => { year, month, count: number }
  };

  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = \`\${year}-\${month}\`;
    
    if (!chartDataMap[key]) {
      chartDataMap[key] = { year, month, monthName: monthNames[month], FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
    const type = isBDE ? "BDE" : "FTTB";
    
    // Add base order value
    chartDataMap[key][type] += val;
    
    // Track for Anfahrt calculation
    const dateStr = date.toISOString().split('T')[0];
    const groupKey = \`\${dateStr}_\${o.vehicle || 'Pool'}\`;
    
    if (type === "FTTB") {
      if (!anfahrtGroups.FTTB[groupKey]) anfahrtGroups.FTTB[groupKey] = { year, month, count: 0 };
      anfahrtGroups.FTTB[groupKey].count += 1;
    } else {
      if (!anfahrtGroups.BDE[groupKey]) anfahrtGroups.BDE[groupKey] = { year, month, count: 0 };
      anfahrtGroups.BDE[groupKey].count += 1;
    }
  });
  
  // Apply FTTB Anfahrt
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
  });
`;

code = code.replace(oldLoop, newLoop);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
