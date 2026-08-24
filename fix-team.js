const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(
  'kundenTerminEnde  DateTime? // Optionales Ende des Kunden-Termins\n    assignedTeam      String?   // z.B. "Auto 1", "Auto 2"',
  'kundenTerminEnde  DateTime? // Optionales Ende des Kunden-Termins'
);

fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
