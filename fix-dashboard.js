const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Add force-dynamic
code = code.replace(
  "export default async function Home() {",
  "export const dynamic = 'force-dynamic';\n\nexport default async function Home() {"
);

// Fix currency formatting
code = code.replace(
  "{openValue.toFixed(2)} '",
  "{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(openValue)}"
);
code = code.replace(
  "{closedValue.toFixed(2)} '",
  "{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(closedValue)}"
);

// Handle encoding glitch that happened when I read it earlier
code = code.replace("'", "€"); // fallback if needed

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
