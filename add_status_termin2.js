const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/actions.ts', 'utf8');

code = code.replace(
  '"Neu",',
  '"Neu",\n          "Wartet auf HTP",'
);

fs.writeFileSync('src/app/terminabsprachen/actions.ts', code, 'utf8');
console.log("Updated terminabsprachen actions");
