const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"use client";\r?\n?/g, '');
  content = '"use client";\n' + content;
  fs.writeFileSync(file, content, 'utf8');
}

fixFile('src/app/page.tsx');
fixFile('src/app/billing/page.tsx');
fixFile('src/app/orders/[id]/page.tsx');

