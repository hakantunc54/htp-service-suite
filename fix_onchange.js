const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const target1 = `value={optionalValue || ""}`;
const replace1 = `value={variableValues[item.id] || ""}`;

const target2 = `onChange={e => setOptionalValue(parseFloat(e.target.value) || 0)}`;
const replace2 = `onChange={e => setVariableValues({...variableValues, [item.id]: parseFloat(e.target.value) || 0})}`;

code = code.replace(target1, replace1).replace(target2, replace2);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed onChange");
