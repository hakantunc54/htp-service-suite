const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

code = code.replace("    }\n  }\n  };\n\n  const handleCall", "    }\n  };\n\n  const handleCall");

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Fixed syntax");
