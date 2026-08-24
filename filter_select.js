const fs = require('fs');
let code = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

// Unassigned block select
code = code.replace(
  `{vehicles.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}`,
  `{vehicles.filter(v => order.orderType?.includes('BdE') ? v.startsWith('T') : v.startsWith('Auto')).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}`
);

// Assigned block select
code = code.replace(
  `{vehicles.map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}`,
  `{vehicles.filter(v => order.orderType?.includes('BdE') ? v.startsWith('T') : v.startsWith('Auto')).map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}`
);

fs.writeFileSync('src/app/planning/page.tsx', code, 'utf8');
