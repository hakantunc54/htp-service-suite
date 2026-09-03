const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

if (!code.includes('import { getTerminabsprachen }')) {
  code = code.replace('import { getDashboardStats } from "./dashboard/actions";', 'import { getDashboardStats } from "./dashboard/actions";\nimport { getTerminabsprachen } from "./terminabsprachen/actions";');
}

const startIdx = code.indexOf('// Hole alle potenziellen');
const endStr = '}).length;';
const endIdx = code.indexOf(endStr, startIdx) + endStr.length;

if (startIdx !== -1 && endIdx !== -1) {
  const oldLogic = code.substring(startIdx, endIdx);
  const newLogic = `// Hole exakt dieselbe Liste an offenen BDE-Rückrufen, die auch der Terminabsprachen-Reiter anzeigt
  const terminabsprachen = await getTerminabsprachen();
  const callbacksToday = terminabsprachen.length;`;
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/app/page.tsx', code, 'utf8');
  console.log("Successfully replaced the block");
} else {
  console.log("Could not find the block");
}
