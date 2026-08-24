const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Kunde erreicht') && lines[i].includes('text-left px-4')) {
    // This is the button line. The next line is the text.
    lines[i+1] = '                  \uD83D\uDCDE Kunde erreicht';
  }
  if (lines[i].includes('Kunde nicht erreicht') && lines[i].includes('text-left px-4')) {
    lines[i+1] = '                  \uD83D\uDCDE Kunde nicht erreicht';
  }
}

fs.writeFileSync('src/app/orders/[id]/page.tsx', lines.join('\n'), 'utf8');
