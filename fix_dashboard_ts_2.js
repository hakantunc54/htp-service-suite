const fs = require('fs');

let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');
pageCode = pageCode.replace(
  /FTTB: Record<string, \{ year: number; month: number; count: number \}>;\s*BDE: Record<string, \{ year: number; month: number; count: number }>;/,
  'FTTB: Record<string, { dateStr: string; count: number }>;\n      BDE: Record<string, { dateStr: string; count: number }>;'
);
fs.writeFileSync('src/app/page.tsx', pageCode, 'utf8');

console.log("Fixed TS errors");
