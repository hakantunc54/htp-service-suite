const fs = require('fs');
let code = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

code = code.replace(
  `{/* Pool: Unzugewiesen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">`,
  `{/* Pool: Unzugewiesen */}
        <div className="w-[320px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">`
);

code = code.replace(
  `{/* Fahrzeuge */}
        {vehicles.map(vehicle => {
          const vehicleOrders = orders.filter(o => o.vehicle === vehicle);
          return (
            <div key={vehicle} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">`,
  `{/* Fahrzeuge */}
        {vehicles.map(vehicle => {
          const vehicleOrders = orders.filter(o => o.vehicle === vehicle);
          return (
            <div key={vehicle} className="w-[320px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">`
);

// Also let's update the dropdown options!
code = code.replace(
  `{vehicles.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}`,
  `{vehicles.filter(v => (order.orderType || '').includes('BdE') ? v.startsWith('T') : v.startsWith('Auto')).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}`
);

code = code.replace(
  `{vehicles.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}`,
  `{vehicles.filter(v => (order.orderType || '').includes('BdE') ? v.startsWith('T') : v.startsWith('Auto')).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}`
);

fs.writeFileSync('src/app/planning/page.tsx', code, 'utf8');
