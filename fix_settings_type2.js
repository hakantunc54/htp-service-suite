const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

content = content.replace(
  /const handleRestore = async \(e\) => \{/,
  'const handleRestore = async (e: React.FormEvent<HTMLFormElement>) => {'
);

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Typescript error fixed.");
