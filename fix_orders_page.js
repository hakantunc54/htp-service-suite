const fs = require("fs");
let content = fs.readFileSync("src/app/orders/page.tsx", "utf8");

const newCode = `  // Filters with Session Storage persistence
  const [search, setSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return searchParams?.get("q") || sessionStorage.getItem("ordersSearch") || "";
    }
    return searchParams?.get("q") || "";
  });
  
  const [dateFilter, setDateFilter] = useState(() => 
    typeof window !== "undefined" ? sessionStorage.getItem("ordersDateFilter") || "" : ""
  );
  
  const [sortColumn, setSortColumn] = useState<string>(() => 
    typeof window !== "undefined" ? sessionStorage.getItem("ordersSortCol") || "Datum" : "Datum"
  );
  
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(() => 
    typeof window !== "undefined" ? (sessionStorage.getItem("ordersSortDir") as "asc" | "desc") || "asc" : "asc"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ordersSearch", search);
      sessionStorage.setItem("ordersDateFilter", dateFilter);
      sessionStorage.setItem("ordersSortCol", sortColumn);
      sessionStorage.setItem("ordersSortDir", sortDirection);
    }
  }, [search, dateFilter, sortColumn, sortDirection]);`;

content = content.replace(/\s*\/\/\s*Filters[\s\S]*?const\s+\[sortDirection,\s*setSortDirection\][^;]+;/, '\n' + newCode);

fs.writeFileSync("src/app/orders/page.tsx", content);
console.log("Successfully replaced code in src/app/orders/page.tsx");
