const fs = require("fs");
let content = fs.readFileSync("src/app/import/actions.ts", "utf8");

content = content.replace(
  /let hasBillingItems = false;[\s\S]*?const initialStatus = hasBillingItems \? "Erfolgreich abgeschlossen" : "Termin vereinbart";/,
  `let hasBillingItems = false;
        let isAbbruch = false;
        for (const [colName, val] of Object.entries(row)) {
          const targetName = columnMap[colName];
          if (targetName && Number(val) > 0) {
            hasBillingItems = true;
            if (targetName.toLowerCase().includes("abbruch") || targetName.toLowerCase().includes("kvhdf")) {
              isAbbruch = true;
            }
          }
        }
  
        // Wenn Leistungen da sind -> Abgeschlossen. Wenn Abbruch -> Abbruch.
        const initialStatus = isAbbruch ? "Abbruch" : (hasBillingItems ? "Erfolgreich abgeschlossen" : "Termin vereinbart");`
);

fs.writeFileSync("src/app/import/actions.ts", content);
console.log("Success");
