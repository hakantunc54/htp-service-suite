const fs = require('fs');
const files = ['src/app/page.tsx', 'src/app/billing/page.tsx', 'src/app/orders/[id]/page.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('"use client";')) {
    // remove all "use client"; and put one at the very top
    content = content.replace(/"use client";\n?/g, '');
    content = '"use client";\n' + content;
    fs.writeFileSync(file, content, 'utf8');
  }
});
