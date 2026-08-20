const fs = require('fs');
let code = fs.readFileSync('src/app/import/actions.ts', 'utf8');

code = code.replace(
  'termin = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));\n        }',
  'termin = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));\n        } else {\n          const parsed = new Date(dateStr);\n          if (!isNaN(parsed.getTime())) termin = parsed;\n        }'
);

fs.writeFileSync('src/app/import/actions.ts', code, 'utf8');
