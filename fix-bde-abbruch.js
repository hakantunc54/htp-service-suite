const fs = require("fs");
let content = fs.readFileSync("src/app/orders/actions.ts", "utf8");

content = content.replace(
  'const finalStatus = hasAbbruch ? "Abbruch" : "Erfolgreich abgeschlossen";',
  'const finalStatus = (hasAbbruch || bdeStatus === "Abbruch") ? "Abbruch" : "Erfolgreich abgeschlossen";'
);

fs.writeFileSync("src/app/orders/actions.ts", content, "utf8");
console.log("Updated saveBilling in actions.ts");
