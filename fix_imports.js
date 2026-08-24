const fs = require('fs');

// 1. Dashboard
let dashboard = fs.readFileSync('src/app/page.tsx', 'utf8');
dashboard = "import RevenueChart from '@/components/RevenueChart';\n" + dashboard;
fs.writeFileSync('src/app/page.tsx', dashboard, 'utf8');

// 2. Billing
let billing = fs.readFileSync('src/app/billing/page.tsx', 'utf8');
billing = "import { generatePdf } from '@/lib/pdfGenerator';\n" + billing;
fs.writeFileSync('src/app/billing/page.tsx', billing, 'utf8');

// 3. Orders
let order = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
order = "import { useRouter } from 'next/navigation';\nimport { Copy } from 'lucide-react';\n" + order;
order = order.replace("import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus } from './actions';", "import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder } from './actions';");
fs.writeFileSync('src/app/orders/[id]/page.tsx', order, 'utf8');
