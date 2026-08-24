const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Import RevenueChart
code = code.replace("import { FileText, CalendarCheck, PhoneCall, TrendingUp, AlertCircle, Euro } from 'lucide-react';", "import { FileText, CalendarCheck, PhoneCall, TrendingUp, AlertCircle, Euro } from 'lucide-react';\nimport RevenueChart from '@/components/RevenueChart';");

// 2. Fetch and prepare data
const dataLogic = `
  // All completed orders for the chart
  const allBilledOrders = await prisma.order.findMany({
    where: { status: "Erfolgreich abgeschlossen" },
    select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true }
  });

  const monthNames = ["Januar", "Februar", "M\\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  
  const chartDataMap: Record<string, any> = {};
  
  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = \`\${year}-\${month}\`;
    
    if (!chartDataMap[key]) {
      chartDataMap[key] = { year, month, monthName: monthNames[month], FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const type = (o.orderType || "").toLowerCase().includes("bde") ? "BDE" : "FTTB";
    chartDataMap[key][type] += val;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
`;

code = code.replace("const formatEuro = (value: number) => {", dataLogic + "\n  const formatEuro = (value: number) => {");

// 3. Insert the chart into the UI
const chartComponent = `
        <div className="mb-8">
          <RevenueChart data={chartData} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
`;

code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-6">', chartComponent);

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
