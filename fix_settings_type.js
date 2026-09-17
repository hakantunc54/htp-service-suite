const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Fix the useState type definition
content = content.replace(
  /useState<"catalog" \| "sms" \| "users">/,
  'useState<"catalog" | "sms" | "users" | "database">'
);

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Settings type fixed.");
