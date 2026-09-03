const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /return <span className="ml-1 text-blue-600">\{sortDirection === "asc" \? "[^"]*" : "[^"]*"\}<\/span>;/;
const newSpan = `return <span className="ml-1 text-blue-600">{sortDirection === "asc" ? "\\u2191" : "\\u2193"}</span>;`;

code = code.replace(regex, newSpan);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed arrows");
