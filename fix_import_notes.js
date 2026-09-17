const fs = require('fs');
let content = fs.readFileSync('src/app/import/actions.ts', 'utf8');

// Modify the history string to include past remarks
content = content.replace(
  /const historyText = pastOrders\.map\(o => \{[\s\S]*?\}\)\.join\(\", \"\);/,
  `const historyText = pastOrders.map(o => {
                const d = o.kundenTerminStart ? new Date(o.kundenTerminStart).toLocaleDateString("de-DE", {timeZone:"Europe/Berlin"}) : "Unbekannt";
                const remark = o.technicianRemark ? o.technicianRemark.replace(/ACHTUNG:[\\s\\S]*/g, '').trim() : '';
                return \`\${d} (\${o.status})\${remark ? \` - Notiz: "\${remark}"\` : ''}\`;
              }).join("\\n");`
);

content = content.replace(
  /pastOrdersStr = `\\n\\nACHTUNG: Kunde hatte bereits einen ABBRUCH auf diesem Port! Vorherige Termine: \$\{historyText\}\. Bitte alte Aktennotizen und Material prǬfen!`;/,
  'pastOrdersStr = `\\n\\nACHTUNG: Kunde hatte bereits einen ABBRUCH auf diesem Port!\\nVorherige Historie:\\n${historyText}`;'
);

content = content.replace(
  /pastOrdersStr = `\\n\\nACHTUNG: Kunde\/Port war bereits im System! Vorherige Termine: \$\{historyText\}\. Bitte alte Aktennotizen prǬfen!`;/,
  'pastOrdersStr = `\\n\\nACHTUNG: Kunde/Port war bereits im System!\\nVorherige Historie:\\n${historyText}`;'
);

fs.writeFileSync('src/app/import/actions.ts', content, 'utf8');
console.log("Smart Import modified to include past notes.");
