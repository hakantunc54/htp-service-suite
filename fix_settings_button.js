const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

const dbButton = `
        <button 
          onClick={() => setActiveTab("database")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "database" ? "bg-slate-800 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <Database className="w-5 h-5" /> Datenbank
        </button>
`;

content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\("users"\)\}/,
  dbButton + '        <button \n          onClick={() => setActiveTab("users")}'
);

if (!content.includes('Database')) {
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import {$1, Database} from "lucide-react";');
}

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Settings button fixed.");
