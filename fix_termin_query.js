const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8');

const oldQuery = `    where: {
      orderType: {
        contains: "BdE"
      },
      status: {`;

const newQuery = `    where: {
      OR: [
        { orderType: { contains: "BdE" } },
        { orderType: { contains: "BDE" } },
        { orderType: { contains: "bde" } },
        { orderType: { contains: "Endleitung" } },
        { orderType: { contains: "endleitung" } }
      ],
      status: {`;

code = code.replace(oldQuery, newQuery);
fs.writeFileSync('src/app/terminabsprachen/actions.ts', code, 'utf8');
console.log("Fixed termin query");
