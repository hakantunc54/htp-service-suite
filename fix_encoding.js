const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// Replace the corrupted string
code = code.replace('f\ufffd\ufffdr', 'f\u00fcr');
code = code.replace('f\ufffdr', 'f\u00fcr');
code = code.replace('f\uFFFD\uFFFDr', 'f\u00fcr');
code = code.replace('f\uFFFDr', 'f\u00fcr');

// Just to be absolutely safe, let's replace by exact string matching the current text
code = code.replace(/Abbruch & Neu klonen \(f.*?2\. Anfahrt\)/g, 'Abbruch & Neu klonen (f\u00fcr 2. Anfahrt)');
code = code.replace(/Auftrag klonen \(f.*? neuen Termin nach Abbruch\)/g, 'Auftrag klonen (f\u00fcr neuen Termin nach Abbruch)');

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Fixed encoding");
