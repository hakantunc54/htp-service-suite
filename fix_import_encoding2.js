const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// The file currently has  character, which in UTF-8 might literally be \uFFFD.
content = content.replace(/pr\uFFFDfen/g, 'prüfen');
content = content.replace(/Geb\uFFFDude/g, 'Gebäude');

fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log('Fixed encoding with UTF8!');
