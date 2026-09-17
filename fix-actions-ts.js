const fs = require("fs");
let content = fs.readFileSync("src/app/orders/[id]/actions.ts", "utf8");

content = content.replace("let updateData = {", "let updateData: any = {");

fs.writeFileSync("src/app/orders/[id]/actions.ts", content, "utf8");
console.log("Fixed TS error");
