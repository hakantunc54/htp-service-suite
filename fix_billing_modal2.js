const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

code = code.replace(
  /<input\s+type="text"\s+placeholder="z\. B\. Kabelkanal 5m gezogen"\s+value=\{technicianRemark\}\s+onChange=\{e => setTechnicianRemark\(e\.target\.value\)\}\s+className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"\s+\/>/g,
  `<textarea
                                placeholder="z. B. Kabelkanal 5m gezogen"
                                value={technicianRemark}
                                onChange={e => setTechnicianRemark(e.target.value)}
                                rows={3}
                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                              />`
);

code = code.replace(
  /billingOrder\.orderType\.includes\(item\.category\)\)\s*\.map/g,
  `billingOrder.orderType.includes(item.category))\n                          .filter(item => !item.name.toLowerCase().includes('anfahrt'))\n                          .map`
);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
