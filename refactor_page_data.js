const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Change Offener Abrechnungswert
const openValueTarget = `<h3 className="text-gray-500 font-medium text-sm">Offener Abrechnungswert (Unerledigt)</h3>
              <p className="text-3xl font-bold mt-1 text-slate-800">{formatEuro(openValue)}</p>`;
const openValueReplace = `<h3 className="text-gray-500 font-medium text-sm">Offene Abrechnungen (Unerledigt)</h3>
              <p className="text-3xl font-bold mt-1 text-slate-800">{financialData._count._all || 0} <span className="text-base font-medium text-gray-400">Aufträge</span></p>`;
code = code.replace(openValueTarget, openValueReplace);

// 2. Add _count to financialData query
code = code.replace(
  '_sum: { orderValue: true },\n      where: { isBilled: false, status: "Erfolgreich abgeschlossen" }',
  '_sum: { orderValue: true },\n      _count: { _all: true },\n      where: { isBilled: false, status: "Erfolgreich abgeschlossen" }'
);

// 3. Change Data Aggregation to daily
const aggRegex = /allBilledOrders\.forEach\(o => \{[\s\S]*?\}\);\s*const chartData = Object\.values\(chartDataMap\)\.sort[^\n]*\n[^\n]*\n[^\n]*\n\s*\}\);/;

const newAgg = `allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateStr = date.toISOString().split('T')[0];
    
    if (!chartDataMap[dateStr]) {
      chartDataMap[dateStr] = { dateStr, year, month, day, dateObj: date, FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
    const type = isBDE ? "BDE" : "FTTB";
    
    chartDataMap[dateStr][type] += val;
    
    const groupKey = \`\${dateStr}_\${o.vehicle || 'Pool'}\`;
    
    if (type === "FTTB") {
      if (!anfahrtGroups.FTTB[groupKey]) anfahrtGroups.FTTB[groupKey] = { dateStr, count: 0 };
      anfahrtGroups.FTTB[groupKey].count += 1;
    } else {
      if (!anfahrtGroups.BDE[groupKey]) anfahrtGroups.BDE[groupKey] = { dateStr, count: 0 };
      anfahrtGroups.BDE[groupKey].count += 1;
    }
  });
  
  const serviceItems = await prisma.serviceItem.findMany({
    where: { name: { contains: "Anfahrt" } }
  });
  
  const priceFttbLt12 = serviceItems.find(i => i.name.includes("<12"))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes(">12"))?.defaultPrice || 55;
  const priceBde = serviceItems.find(i => i.name.includes("BdE") && i.name.includes("Anfahrt"))?.defaultPrice || 38;

  Object.values(anfahrtGroups.FTTB).forEach(group => {
    if (group.count > 0) {
      const anfahrtPreis = group.count >= 12 ? priceFttbGt12 : priceFttbLt12;
      chartDataMap[group.dateStr]["FTTB"] += anfahrtPreis;
      closedValue += anfahrtPreis;
    }
  });

  Object.values(anfahrtGroups.BDE).forEach(group => {
    if (group.count > 0) {
      chartDataMap[group.dateStr]["BDE"] += priceBde;
      closedValue += priceBde;
    }
  });

  const chartData = Object.values(chartDataMap).sort((a: any, b: any) => {
    return a.dateObj.getTime() - b.dateObj.getTime();
  });`;

if (aggRegex.test(code)) {
    code = code.replace(aggRegex, newAgg);
    fs.writeFileSync('src/app/page.tsx', code, 'utf8');
    console.log("Refactored page.tsx");
} else {
    console.log("Regex failed in page.tsx");
}
