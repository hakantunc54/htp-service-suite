const fs = require("fs");
let content = fs.readFileSync("src/app/orders/page.tsx", "utf8");

content = content.replace(
  'sessionStorage.setItem("ordersSortDir", sortDirection);',
  'sessionStorage.setItem("ordersSortDir", sortDirection);\n      sessionStorage.setItem("ordersStatusFilter", statusFilter);'
);

content = content.replace(
  '}, [searchParams]);',
  '}, [searchParams, search, dateFilter, sortColumn, sortDirection, statusFilter]);'
);

// Add filtering logic
const filterLogicRegex = /matchesDate = orderDateStr === dateFilter;\n          \}\n        \}\n\n      return matchesSearch && matchesDate;\n    \}\)\.sort/g;
content = content.replace(filterLogicRegex, `matchesDate = orderDateStr === dateFilter;
          }
        }

      // 3. Status Filter
      let matchesStatus = true;
      if (statusFilter && statusFilter !== "Alle") {
        matchesStatus = o.status === statusFilter;
      }

      return matchesSearch && matchesDate && matchesStatus;
    }).sort`);

// Add UI
const uiRegex = /<div className="relative w-full md:w-96">\n\s*<Search[\s\S]*?<\/div>\n\s*<div className="flex items-center/g;
content = content.replace(uiRegex, `<div className="flex flex-col sm:flex-row gap-4 w-full md:flex-1">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Suchen (Name, Adresse, Typ)..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <select
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white shadow-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="Alle">Alle Statusse</option>
              <option value="Neu">Neu</option>
              <option value="Termin abstimmen">Termin abstimmen</option>
              <option value="Termin vereinbart">Termin vereinbart</option>
              <option value="Erfolgreich abgeschlossen">Erfolgreich abgeschlossen</option>
              <option value="Abbruch">Abbruch</option>
              <option value="Storno HTP">Storno HTP</option>
            </select>
          </div>
            
          <div className="flex items-center`);

// Update reset button
content = content.replace(
  '{(dateFilter || search) && (',
  '{(dateFilter || search || statusFilter !== "Alle") && ('
);
content = content.replace(
  'onClick={() => { setDateFilter(""); setSearch(""); }}',
  'onClick={() => { setDateFilter(""); setSearch(""); setStatusFilter("Alle"); }}'
);

fs.writeFileSync("src/app/orders/page.tsx", content, "utf8");
console.log("Success");
