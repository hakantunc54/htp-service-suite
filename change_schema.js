const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace('quantity      Int      @default(1)', 'quantity      Float    @default(1)');
fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
console.log("Updated schema.prisma");
