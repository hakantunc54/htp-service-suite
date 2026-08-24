const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
code = code.replace("import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus } from \"./actions\";", "import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder } from \"./actions\";");
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
