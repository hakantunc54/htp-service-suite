const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldAnfahrt = `const anfahrtGroups = {
    FTTB: {}, // key: "YYYY-MM-DD_Vehicle" => { year, month, count: number }
    BDE: {}   // key: "YYYY-MM-DD_Vehicle" => { year, month, count: number }
  };`;

const newAnfahrt = `const anfahrtGroups: {
    FTTB: Record<string, { year: number; month: number; count: number }>;
    BDE: Record<string, { year: number; month: number; count: number }>;
  } = {
    FTTB: {},
    BDE: {}
  };`;

code = code.replace(oldAnfahrt, newAnfahrt);
fs.writeFileSync('src/app/page.tsx', code, 'utf8');
