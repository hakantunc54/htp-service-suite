const fs = require('fs');
const files = [
  'src/app/orders/[id]/page.tsx',
  'src/app/orders/page.tsx',
  'src/app/planning/page.tsx',
  'src/app/terminabsprachen/page.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    if (code.toLowerCase().includes('klon') || code.toLowerCase().includes('clone') || code.toLowerCase().includes('duplizier') || code.toLowerCase().includes('abbruch')) {
      console.log("Found in", f);
    }
  }
});
