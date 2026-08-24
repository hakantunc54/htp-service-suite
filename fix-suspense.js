const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Ensure Suspense is imported from React
if (!code.includes('import { Suspense }')) {
  code = code.replace(
    'import { useEffect, useState } from "react";',
    'import { useEffect, useState, Suspense } from "react";'
  );
}

// Rename the default export component to a sub-component
code = code.replace(
  'export default function OrdersPage() {',
  'function OrdersContent() {'
);

// Add the default export with Suspense at the bottom
const suspenseWrapper = `
export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Lade Aufträge...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
`;

code += '\n' + suspenseWrapper;

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
