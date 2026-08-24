const fs = require('fs');

let page = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Remove the global password box completely
page = page.replace(
  /<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">[\s\S]*?<\/div>\s*<\/div>/,
  ''
);

// Add Pencil Icon to Lucide imports
page = page.replace(
  'Settings, Users, Calculator, MessageSquare, Save, Plus',
  'Settings, Users, Calculator, MessageSquare, Save, Plus, Edit2'
);

// Add prompt handler
const promptHandler = `
  const handlePasswordChange = async (userId: string, userName: string) => {
    const newPass = prompt(\`Neues Passwort für \${userName} eingeben (mind. 5 Zeichen):\`);
    if (!newPass) return;
    if (newPass.length < 5) return toast.error("Passwort zu kurz!");
    
    const res = await updatePassword(userId, newPass);
    if (res.success) {
      toast.success(\`Passwort für \${userName} erfolgreich geändert!\`);
    } else {
      toast.error("Fehler beim Ändern.");
    }
  };
`;

page = page.replace(
  'const handleSaveSms = async (id: string) => {',
  promptHandler + '\n  const handleSaveSms = async (id: string) => {'
);

// Add Edit Button in the table
page = page.replace(
  '<td className="px-4 py-4 text-right">\n                      <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">Aktiv</span>\n                    </td>',
  `<td className="px-4 py-4 text-right flex items-center justify-end gap-3">
                      <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">Aktiv</span>
                      <button 
                        onClick={() => handlePasswordChange(user.id, user.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Passwort ändern"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>`
);

fs.writeFileSync('src/app/settings/page.tsx', page, 'utf8');
