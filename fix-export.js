const fs = require('fs');
let code = fs.readFileSync('src/app/api/export-billing/route.ts', 'utf8');

// The `orderBy` is an array for multiple sorts in prisma:
code = code.replace(
  /orderBy: {\s*kundenTerminStart: 'asc'\s*}/g,
  `orderBy: [
          { kundenTerminStart: 'asc' },
          { vehicle: 'asc' }
        ]`
);

fs.writeFileSync('src/app/api/export-billing/route.ts', code, 'utf8');
