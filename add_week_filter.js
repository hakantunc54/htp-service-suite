const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. State
code = code.replace(
  'const [dateFilter, setDateFilter] = useState("");',
  'const [dateFilter, setDateFilter] = useState("");\n  const [weekFilter, setWeekFilter] = useState("");'
);

// 2. Filter logic
const dateLogicTarget = `// 2. Date Filter
      let matchesDate = true;
      if (dateFilter) {
        if (!o.kundenTerminStart) {
          matchesDate = false;
        } else {
          const orderDateStr = new Date(o.kundenTerminStart).toISOString().split('T')[0];
          matchesDate = orderDateStr === dateFilter;
        }
      }`;
const dateLogicReplace = `// 2. Date Filter
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

code = code.replace(dateLogicTarget, dateLogicReplace);

// 3. UI logic
const uiTarget = `<div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Datum:</span>
              <input 
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter("")}
                  className="text-xs text-red-500 hover:underline whitespace-nowrap"
                >
                  Filter löschen
                </button>
              )}
            </div>`;

// Fallback if spaces differ
const uiTargetRegex = /<div className="flex items-center gap-2 w-full md:w-auto">[\s\S]*?Filter l\u00f6schen\s*<\/button>\s*\)\}\s*<\/div>/;

const uiReplace = `<div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:inline">Filter:</span>
              <input 
                type="date"
                title="Tagesfilter"
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setWeekFilter(""); }}
              />
              <input 
                type="week"
                title="Wochenfilter"
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
                value={weekFilter}
                onChange={e => { setWeekFilter(e.target.value); setDateFilter(""); }}
              />
              {(dateFilter || weekFilter) && (
                <button 
                  onClick={() => { setDateFilter(""); setWeekFilter(""); }}
                  className="text-xs text-red-500 hover:underline whitespace-nowrap"
                >
                  Filter l\u00f6schen
                </button>
              )}
            </div>`;

if (code.includes(uiTarget)) {
   code = code.replace(uiTarget, uiReplace);
} else {
   code = code.replace(uiTargetRegex, uiReplace);
}

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Added week filter");
