const fs = require('fs');
let content = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

content = content.replace(/Auftrag l\uFFFDschen/g, 'Auftrag löschen');
content = content.replace(/Keine Auftr\uFFFDege gefunden/g, 'Keine Aufträge gefunden');
content = content.replace(/Keine Auftr\uFFFDge gefunden/g, 'Keine Aufträge gefunden');
content = content.replace(/Lade Auftr\uFFFDge/g, 'Lade Aufträge');

fs.writeFileSync('src/app/orders/page.tsx', content, 'utf8');
