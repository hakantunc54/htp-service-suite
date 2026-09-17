const fs = require('fs');
let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Add AlertTriangle icon import if not present
if (!content.includes('AlertTriangle')) {
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import {$1, AlertTriangle} from "lucide-react";');
}

// Inject the warning icon next to the customer name
content = content.replace(
  /<div className="font-bold text-slate-900">\{order\.customer\.customerName\}<\/div>/,
  `<div className="font-bold text-slate-900 flex items-center gap-2">
                          {order.customer.customerName}
                          {order.technicianRemark && order.technicianRemark.includes('ACHTUNG:') && (
                            <div className="group relative flex items-center">
                              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                              <div className="absolute left-full ml-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl whitespace-pre-wrap">
                                {order.technicianRemark}
                              </div>
                            </div>
                          )}
                        </div>`
);

fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
console.log("Alert icon added to orders page.");
