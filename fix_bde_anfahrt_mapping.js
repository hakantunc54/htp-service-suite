const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

code = code.replace(
  '"Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)",',
  '"Arbeitszeit": "Arbeitszeit (Std.)", "Material": "Material (BDE)", "Anfahrt": "Anfahrt (BDE)",'
);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
