const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Add sorting state
const stateRegex = /const \[dateFilter, setDateFilter\] = useState\(""\);/m;
const newState = `const [dateFilter, setDateFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("Datum");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };
  
  const renderSortIndicator = (col: string) => {
    if (sortColumn !== col) return null;
    return <span className="ml-1 text-blue-600">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>;
  };`;
code = code.replace(stateRegex, newState);

// Apply sorting to filteredOrders
const filterRegex = /return matchesSearch && matchesDate;\s*\};\s*const filteredOrders = orders\.filter\(o => \{[\s\S]*?return matchesSearch && matchesDate;\s*\}\);/m;
// Actually it's `const filteredOrders = orders.filter(...)`
const filteredRegex = /const filteredOrders = orders\.filter\(o => \{[\s\S]*?return matchesSearch && matchesDate;\s*\}\);/m;
const newFiltered = `const filteredOrders = orders.filter(o => {
    // 1. Search term
    const term = search.toLowerCase();
    const matchesSearch = 
      o.customer.customerName.toLowerCase().includes(term) ||
      o.customer.address.toLowerCase().includes(term) ||
      (o.orderType?.toLowerCase() || "").includes(term) ||
      (o.customer.customerNumber?.toLowerCase() || "").includes(term) ||
      (o.customer.phone?.toLowerCase() || "").includes(term) ||
      (o.customer.mobile?.toLowerCase() || "").includes(term);
    
    // 2. Date Filter
    let matchesDate = true;
    if (dateFilter) {
      if (!o.kundenTerminStart) {
        matchesDate = false;
      } else {
        const orderDateStr = new Date(o.kundenTerminStart).toISOString().split('T')[0];
        matchesDate = orderDateStr === dateFilter;
      }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    let valA: any = "";
    let valB: any = "";
    
    if (sortColumn === "Kunde") {
      valA = a.customer.customerName;
      valB = b.customer.customerName;
    } else if (sortColumn === "Adresse") {
      valA = a.customer.address;
      valB = b.customer.address;
    } else if (sortColumn === "Auftragstyp") {
      valA = a.orderType || "";
      valB = b.orderType || "";
    } else if (sortColumn === "Status") {
      valA = a.status || "";
      valB = b.status || "";
    } else if (sortColumn === "Abrechnung") {
      valA = a.status === "Abgerechnet" ? "1" : "0";
      valB = b.status === "Abgerechnet" ? "1" : "0";
    } else if (sortColumn === "Datum") {
      valA = a.kundenTerminStart ? new Date(a.kundenTerminStart).getTime() : 0;
      valB = b.kundenTerminStart ? new Date(b.kundenTerminStart).getTime() : 0;
    }
    
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });`;
code = code.replace(filteredRegex, newFiltered);

// Make table headers clickable
const theadRegex = /<thead className="bg-gray-50\/50 border-b border-gray-100">[\s\S]*?<\/thead>/m;
const newThead = `<thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th onClick={() => handleSort("Kunde")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Kunde {renderSortIndicator("Kunde")}
                  </th>
                  <th onClick={() => handleSort("Adresse")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Adresse {renderSortIndicator("Adresse")}
                  </th>
                  <th onClick={() => handleSort("Auftragstyp")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Auftragstyp {renderSortIndicator("Auftragstyp")}
                  </th>
                  <th onClick={() => handleSort("Datum")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Datum {renderSortIndicator("Datum")}
                  </th>
                  <th onClick={() => handleSort("Status")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Status {renderSortIndicator("Status")}
                  </th>
                  <th onClick={() => handleSort("Abrechnung")} className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                    Abrechnung {renderSortIndicator("Abrechnung")}
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>`;
code = code.replace(theadRegex, newThead);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Updated sorting in page.tsx");
