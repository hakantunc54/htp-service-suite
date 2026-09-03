const fs = require('fs');
const path = require('path');
function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
    else if (fullPath.endsWith('.tsx')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      if (code.includes('handleUpdateQuantity')) console.log(fullPath);
    }
  });
}
walk('src');
