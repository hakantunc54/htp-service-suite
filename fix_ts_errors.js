const fs = require('fs');

// Fix page.tsx
let pageCode = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');
pageCode = pageCode.replace('s.priceApplied * s.quantity', '(s.priceApplied || 0) * s.quantity');
fs.writeFileSync('src/app/orders/[id]/page.tsx', pageCode, 'utf8');

// Fix EditServicesModal.tsx
let modalCode = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');
modalCode = modalCode.replace('priceApplied: number;', 'priceApplied: number | null;');
modalCode = modalCode.replace('item.priceApplied * item.quantity', '(item.priceApplied || 0) * item.quantity');
modalCode = modalCode.replace('s.priceApplied', 's.priceApplied || 0');
fs.writeFileSync('src/components/EditServicesModal.tsx', modalCode, 'utf8');

