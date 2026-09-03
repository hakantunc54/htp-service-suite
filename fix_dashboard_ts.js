const fs = require('fs');

// 1. Fix page.tsx typings
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');
pageCode = pageCode.replace(
  'FTTB: Record<string, { year: number; month: number; count: number }>;\n      BDE: Record<string, { year: number; month: number; count: number }>;',
  'FTTB: Record<string, { dateStr: string; count: number }>;\n      BDE: Record<string, { dateStr: string; count: number }>;'
);
fs.writeFileSync('src/app/page.tsx', pageCode, 'utf8');

// 2. Fix RevenueChart.tsx setYear
let chartCode = fs.readFileSync('src/components/RevenueChart.tsx', 'utf8');
chartCode = chartCode.replace(
  'onChange={(e) => setYear(Number(e.target.value))}',
  'onChange={(e) => setSelectedYear(Number(e.target.value))}'
);
fs.writeFileSync('src/components/RevenueChart.tsx', chartCode, 'utf8');

console.log("Fixed TS errors");
