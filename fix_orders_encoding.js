const fs = require('fs');
let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

content = content.replace(/Auftrag l\uFFFDschen/g, 'Auftrag löschen');
content = content.replace(/M\uFFF0chten Sie/g, 'Möchten Sie');
content = content.replace(/M\uFFFDchten Sie/g, 'Möchten Sie');
content = content.replace(/wirklich l\uFFFDschen/g, 'wirklich löschen');
content = content.replace(/r\uFFF0ckg\uFFF0ngig/g, 'rückgängig');
content = content.replace(/r\uFFFDckg\uFFFDngig/g, 'rückgängig');
content = content.replace(/L\uFFFDschen/g, 'Löschen');

fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
console.log('Fixed umlauts');
