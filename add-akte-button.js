const fs = require("fs");
let content = fs.readFileSync("src/app/terminabsprachen/page.tsx", "utf8");

// 1. Add FolderOpen to lucide-react import
content = content.replace(
  'import { Phone, CalendarCheck, Clock, CarFront, ChevronDown, FileText } from "lucide-react";',
  'import { Phone, CalendarCheck, Clock, CarFront, ChevronDown, FileText, FolderOpen } from "lucide-react";'
);

// 2. Add next/link import below useState
content = content.replace(
  'import { useEffect, useState } from "react";',
  'import { useEffect, useState } from "react";\nimport Link from "next/link";'
);

// 3. Replace the button container block
const btnRegex = /<button \n\s*onClick={\(\) => handleCall\(order\.id, order\.customer\.mobile \|\| order\.customer\.phone\)}\n\s*className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"\n\s*>\n\s*<Phone className="w-4 h-4" \/> Anrufen\n\s*<\/button>/g;

const replacement = `<div className="flex flex-col gap-2 min-w-[120px]">
                      <button 
                        onClick={() => handleCall(order.id, order.customer.mobile || order.customer.phone)}
                        className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full"
                      >
                        <Phone className="w-4 h-4" /> Anrufen
                      </button>
                      <Link 
                        href={\`/orders/\${order.id}\`}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full"
                      >
                        <FolderOpen className="w-4 h-4" /> Akte
                      </Link>
                    </div>`;

content = content.replace(btnRegex, replacement);

fs.writeFileSync("src/app/terminabsprachen/page.tsx", content, "utf8");
console.log("Updated terminabsprachen page.");
