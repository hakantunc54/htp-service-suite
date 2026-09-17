const fs = require('fs');

let backupContent = fs.readFileSync('src/app/api/db-backup/route.ts', 'utf8');
backupContent = backupContent.replace(
  /const dbPath = path\.join\(process\.cwd\(\), "htp-data", "dev\.db"\);/,
  'const dbPath = "/data/dev.db"; // Docker volume mount path'
);
fs.writeFileSync('src/app/api/db-backup/route.ts', backupContent, 'utf8');

let restoreContent = fs.readFileSync('src/app/api/db-restore/route.ts', 'utf8');
restoreContent = restoreContent.replace(
  /const dbPath = path\.join\(process\.cwd\(\), "htp-data", "dev\.db"\);/,
  'const dbPath = "/data/dev.db"; // Docker volume mount path'
);
fs.writeFileSync('src/app/api/db-restore/route.ts', restoreContent, 'utf8');

console.log("Database paths fixed.");
