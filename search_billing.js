const fs = require('fs');
const files = ['src/app/billing/page.tsx', 'src/app/orders/[id]/page.tsx', 'src/app/planning/page.tsx'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    if (code.includes('handleUpdateQuantity')) console.log("Found in", f);
  }
});
