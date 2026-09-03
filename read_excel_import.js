const fs = require('fs');
const lines = fs.readFileSync('src/app/import/actions.ts', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('export async function saveHistoricalExcelData'));
for(let i = idx; i < idx + 40; i++) {
  if (lines[i]) console.log(i, lines[i]);
}
