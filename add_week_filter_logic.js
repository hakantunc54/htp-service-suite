const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /\/\/ 2\. Date Filter\s*let matchesDate = true;\s*if \(dateFilter\) \{\s*if \(\!o\.kundenTerminStart\) \{\s*matchesDate = false;\s*\} else \{\s*const orderDateStr = new Date\(o\.kundenTerminStart\)\.toISOString\(\)\.split\('T'\)\[0\];\s*matchesDate = orderDateStr === dateFilter;\s*\}\s*\}/;

const replace = `// 2. Date Filter
      let matchesDate = true;
      if (dateFilter) {
        if (!o.kundenTerminStart) {
          matchesDate = false;
        } else {
          const orderDateStr = new Date(o.kundenTerminStart).toISOString().split('T')[0];
          matchesDate = orderDateStr === dateFilter;
        }
      } else if (weekFilter) {
        if (!o.kundenTerminStart) {
          matchesDate = false;
        } else {
          const d = new Date(o.kundenTerminStart);
          const dt = new Date(d.valueOf());
          dt.setDate(dt.getDate() - ((d.getDay() + 6) % 7) + 3);
          const firstThursday = dt.valueOf();
          dt.setMonth(0, 1);
          if (dt.getDay() !== 4) {
            dt.setMonth(0, 1 + ((4 - dt.getDay()) + 7) % 7);
          }
          const week = 1 + Math.ceil((firstThursday - dt) / 604800000);
          
          const dtYear = new Date(d.valueOf());
          dtYear.setDate(dtYear.getDate() - ((d.getDay() + 6) % 7) + 3);
          const orderWeekStr = \`\${dtYear.getFullYear()}-W\${week.toString().padStart(2, '0')}\`;
          
          matchesDate = orderWeekStr === weekFilter;
        }
      }`;

if (regex.test(code)) {
    code = code.replace(regex, replace);
    fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
    console.log("Added week filter logic");
} else {
    console.log("Regex didn't match");
}
