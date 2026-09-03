const fs = require('fs');
const lines = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8').split('\n');
for(let i = 245; i < 280; i++) {
  if(lines[i]) console.log(i, lines[i]);
}
