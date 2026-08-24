const fs = require('fs');

// 1. Fix export-billing/route.ts
let exportRoute = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');
exportRoute = exportRoute.replace("const totals = { fttb: {}, bde: {}, fttbTotal: 0, bdeTotal: 0 };", "const totals: any = { fttb: {}, bde: {}, fttbTotal: 0, bdeTotal: 0 };");
exportRoute = exportRoute.replace(/s\.priceApplied/g, '(s.priceApplied || 0)');
exportRoute = exportRoute.replace("request.nextUrl.searchParams", "new URL(request.url).searchParams");
fs.writeFileSync('src/app/api/export-billing/route.ts', exportRoute, 'utf8');

// 2. Fix billing/page.tsx
let billingPage = fs.readFileSync('src/app/billing/page.tsx', 'utf8');
if (!billingPage.includes("import { generatePdf }")) {
  billingPage = billingPage.replace("import { Download, Calendar, Calculator, FileText } from \"lucide-react\";", "import { Download, Calendar, Calculator, FileText } from \"lucide-react\";\nimport { generatePdf } from '@/lib/pdfGenerator';");
}
fs.writeFileSync('src/app/billing/page.tsx', billingPage, 'utf8');

// 3. Fix orders/[id]/page.tsx
let orderPage = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
if (!orderPage.includes("import { useRouter }")) {
  orderPage = orderPage.replace("import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder } from './actions';", "import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder } from './actions';\nimport { useRouter } from 'next/navigation';\nimport { Copy } from 'lucide-react';");
}
fs.writeFileSync('src/app/orders/[id]/page.tsx', orderPage, 'utf8');

// 4. Fix page.tsx (Dashboard)
let dashboard = fs.readFileSync('src/app/page.tsx', 'utf8');
if (!dashboard.includes("import RevenueChart")) {
  dashboard = dashboard.replace("import { FileText, CalendarCheck, PhoneCall, TrendingUp, AlertCircle, Euro } from 'lucide-react';", "import { FileText, CalendarCheck, PhoneCall, TrendingUp, AlertCircle, Euro } from 'lucide-react';\nimport RevenueChart from '@/components/RevenueChart';");
}
fs.writeFileSync('src/app/page.tsx', dashboard, 'utf8');

// 5. Fix pdfGenerator.ts
let pdfGen = fs.readFileSync('src/lib/pdfGenerator.ts', 'utf8');
pdfGen = pdfGen.replace("if (data.row.raw[0] && typeof data.row.raw[0] === 'object' && data.row.raw[0].content === '')", "if ((data.row.raw as any)[0] && typeof (data.row.raw as any)[0] === 'object' && (data.row.raw as any)[0].content === '')");
fs.writeFileSync('src/lib/pdfGenerator.ts', pdfGen, 'utf8');

