const fs = require('fs');
let code = fs.readFileSync('Dockerfile', 'utf8');

code = code.replace('RUN npx prisma db push', 'RUN npx prisma db push --accept-data-loss');
code = code.replace('CMD ["sh", "-c", "npx prisma db push && npm start"]', 'CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]');

fs.writeFileSync('Dockerfile', code, 'utf8');
console.log("Updated Dockerfile");
