const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// 1. Remove weekFilter state
code = code.replace('const [weekFilter, setWeekFilter] = useState("");\n', '');

// 2. Fix the date filtering logic
const filterRegex = /\/\/ 2\. Date Filter\s*let matchesDate = true;[\s\S]*?matchesDate = orderWeekStr === weekFilter;\s*\}\s*\}/;
const newFilterLogic = `// 2. Date Filter
      let matchesDate = true;
      if (dateFilter) {
        if (!o.kundenTerminStart) {
          matchesDate = false;
        } else {
          // Use local time for filtering, NOT UTC, to match the UI rendering!
          const d = new Date(o.kundenTerminStart);
          const localYear = d.getFullYear();
          const localMonth = String(d.getMonth() + 1).padStart(2, '0');
          const localDay = String(d.getDate()).padStart(2, '0');
          const orderDateStr = \`\${localYear}-\${localMonth}-\${localDay}\`;
          matchesDate = orderDateStr === dateFilter;
        }
      }`;

if (filterRegex.test(code)) {
    code = code.replace(filterRegex, newFilterLogic);
} else {
    console.log("Filter regex didn't match");
}

// 3. Revert UI
const uiRegex = /<div className="flex items-center gap-2 w-full md:w-auto">[\s\S]*?Filter l\\u00f6schen\s*<\/button>\s*\)\}\s*<\/div>/;
const uiRegexFallback = /<div className="flex items-center gap-2 w-full md:w-auto">[\s\S]*?Filter lschen\s*<\/button>\s*\)\}\s*<\/div>/;

const newUI = `<div className="flex items-center gap-2 w-full md:w-auto">
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
                  Filter l\u00f6schen
                </button>
              )}
            </div>`;

if (uiRegex.test(code)) {
    code = code.replace(uiRegex, newUI);
} else if (uiRegexFallback.test(code)) {
    code = code.replace(uiRegexFallback, newUI);
} else {
    // try to find it manually
    const start = code.indexOf('<div className="flex items-center gap-2 w-full md:w-auto">');
    const endStr = '</button>\n              )}\n            </div>';
    const end = code.indexOf(endStr, start);
    if (start !== -1 && end !== -1) {
        code = code.substring(0, start) + newUI + code.substring(end + endStr.length);
    } else {
        console.log("UI replace failed");
    }
}

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Date filter fixed");
