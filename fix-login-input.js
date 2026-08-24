const fs = require('fs');

let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

code = code.replace(
  /className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/g,
  'className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"'
);

fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
