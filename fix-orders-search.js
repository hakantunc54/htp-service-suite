const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Add useSearchParams
code = code.replace(
  'import { getOrders, getServiceItems, saveBilling } from "./actions";',
  'import { getOrders, getServiceItems, saveBilling } from "./actions";\nimport { useSearchParams } from "next/navigation";'
);

// Add useSearchParams inside component
code = code.replace(
  'export default function OrdersPage() {',
  'export default function OrdersPage() {\n  const searchParams = useSearchParams();'
);

// Initialize search state
code = code.replace(
  'const [search, setSearch] = useState("");',
  'const [search, setSearch] = useState(searchParams?.get("q") || "");'
);

// We should also add a useEffect to sync if the URL changes without unmounting (though Next.js usually remounts or we can just listen to searchParams)
code = code.replace(
  'const [dateFilter, setDateFilter] = useState("");',
  'const [dateFilter, setDateFilter] = useState("");\n\n  useEffect(() => {\n    if (searchParams?.get("q")) setSearch(searchParams.get("q") || "");\n  }, [searchParams]);'
);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
