const fs = require("fs");
let content = fs.readFileSync("src/app/orders/page.tsx", "utf8");

content = content.replace(
  /order\.status === "Storniert" \? "bg-red-100 text-red-800" :/g,
  `order.status === "Storniert" || order.status === "Abbruch" ? "bg-red-100 text-red-800" :`
);

fs.writeFileSync("src/app/orders/page.tsx", content);
console.log("Success");
