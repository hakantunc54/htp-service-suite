const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

const regex = /technicianRemark    String\?/m;
const newFields = `technicianRemark    String?
  bdeStatus           String?
  materialDetails     String?`;

code = code.replace(regex, newFields);
fs.writeFileSync('prisma/schema.prisma', code, 'utf8');
console.log("Updated schema");
