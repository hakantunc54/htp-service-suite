const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

content = content.replace(
  'import { Settings, Users, Calculator, MessageSquare, Save, Plus, Edit2 } from "lucide-react";',
  'import { Settings, Users, Calculator, MessageSquare, Save, Plus, Edit2, Database } from "lucide-react";'
);

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Database icon imported.");
