const fs = require('fs');
let code = fs.readFileSync('src/lib/parser.ts', 'utf8');

const oldBlock = `else if (line.toLowerCase().startsWith('port:')) {
            port = line.substring(5).trim();
          }`;
          
const newBlock = `else if (line.toLowerCase().startsWith('port:')) {
            port = line.substring(5).trim();
          } else if (line.toLowerCase().startsWith('netzelement:')) {
            port = line.substring(12).trim();
          } else if (line.toLowerCase().includes('port') && !port) {
            const match = line.match(/(?:port|netzelement)\\s*[:\\-]?\\s*([a-zA-Z0-9\\-\\/\\.]+)/i);
            if (match) port = match[1];
          }`;

// Let's use a regex to replace it so whitespace doesn't mess it up
code = code.replace(/else if \(line\.toLowerCase\(\)\.startsWith\('port:'\)\)\s*\{\s*port = line\.substring\(5\)\.trim\(\);\s*\}/, newBlock);

fs.writeFileSync('src/lib/parser.ts', code, 'utf8');
