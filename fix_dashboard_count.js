const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const importRegex = /import \{ getDashboardStats \} from "\.\/dashboard\/actions";/;
const newImport = `import { getDashboardStats } from "./dashboard/actions";
import { getTerminabsprachen } from "./terminabsprachen/actions";`;
code = code.replace(importRegex, newImport);

const logicRegex = /\/\/ Hole alle potenziellen Rckrufe und filtere FTTB hart in JavaScript heraus[\s\S]*?const callbacksToday = rawCallbacks\.filter\(o => \{[\s\S]*?\}\)\.length;/m;
const newLogic = `// Hole exakt dieselbe Liste an offenen BDE-Rückrufen, die auch der Terminabsprachen-Reiter anzeigt
  const terminabsprachen = await getTerminabsprachen();
  const callbacksToday = terminabsprachen.length;`;
code = code.replace(logicRegex, newLogic);

fs.writeFileSync('src/app/page.tsx', code, 'utf8');
console.log("Fixed dashboard callback count");
