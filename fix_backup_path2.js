const fs = require('fs');

const fallbackLogic = `
  let dbPath = "/data/dev.db";
  if (!fs.existsSync(dbPath)) {
    // Fallback for local development
    dbPath = path.join(process.cwd(), "htp-data", "dev.db");
  }
`;

let backupContent = fs.readFileSync('src/app/api/db-backup/route.ts', 'utf8');
backupContent = backupContent.replace(
  /const dbPath = "\/data\/dev\.db"; \/\/ Docker volume mount path/,
  fallbackLogic
);
fs.writeFileSync('src/app/api/db-backup/route.ts', backupContent, 'utf8');

let restoreContent = fs.readFileSync('src/app/api/db-restore/route.ts', 'utf8');
restoreContent = restoreContent.replace(
  /const dbPath = "\/data\/dev\.db"; \/\/ Docker volume mount path/,
  fallbackLogic
);
fs.writeFileSync('src/app/api/db-restore/route.ts', restoreContent, 'utf8');

console.log("Database paths fixed with fallback.");
