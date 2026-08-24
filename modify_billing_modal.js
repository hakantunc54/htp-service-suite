const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. Change input to textarea for technicianRemark
const oldInput = `<input
                                type="text"
                                placeholder="z. B. Kabelkanal 5m gezogen"
                                value={technicianRemark}
                                onChange={e => setTechnicianRemark(e.target.value)}
                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />`;

const newTextarea = `<textarea
                                placeholder="z. B. Kabelkanal 5m gezogen"
                                value={technicianRemark}
                                onChange={e => setTechnicianRemark(e.target.value)}
                                rows={3}
                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                              />`;

code = code.replace(oldInput, newTextarea);

// 2. Hide Anfahrt (BDE) from the modal by filtering the serviceItems before mapping
const oldMap = `serviceItems
                          .filter(item => item.category === 'ALL' || billingOrder.orderType.includes(item.category))
                          .map(item => {`;

const newMap = `serviceItems
                          .filter(item => item.category === 'ALL' || billingOrder.orderType.includes(item.category))
                          .filter(item => !item.name.toLowerCase().includes('anfahrt'))
                          .map(item => {`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
