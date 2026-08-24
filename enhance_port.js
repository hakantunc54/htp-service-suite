const fs = require('fs');
let code = fs.readFileSync('src/lib/parser.ts', 'utf8');

// For standard FTTB parsing:
code = code.replace(
  `else if (line.toLowerCase().startsWith('port:')) {\n            port = line.substring(5).trim();\n          }`,
  `else if (line.toLowerCase().startsWith('port:')) {
            port = line.substring(5).trim();
          } else if (line.toLowerCase().startsWith('netzelement:')) {
            port = line.substring(12).trim();
          } else if (line.toLowerCase().includes('port') && !port) {
            const match = line.match(/(?:port|netzelement)\\s*[:\\-]?\\s*([a-zA-Z0-9\\-\\/\\.]+)/i);
            if (match) port = match[1];
          }`
);

// For BDE parsing:
code = code.replace(
  `else if (lower.startsWith('port:')) port = line.substring(5).trim();`,
  `else if (lower.startsWith('port:')) port = line.substring(5).trim();
          else if (lower.startsWith('netzelement:')) port = line.substring(12).trim();
          else if (lower.includes('port') && !port) {
            const match = line.match(/(?:port|netzelement)\\s*[:\\-]?\\s*([a-zA-Z0-9\\-\\/\\.]+)/i);
            if (match) port = match[1];
          }`
);

fs.writeFileSync('src/lib/parser.ts', code, 'utf8');
