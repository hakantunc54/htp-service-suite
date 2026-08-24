const fs = require('fs');

let actions = fs.readFileSync('src/app/settings/actions.ts', 'utf8');
actions += `\n
import bcrypt from "bcrypt";
export async function updatePassword(userId: string, newPassword: string) {
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hash }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
`;
fs.writeFileSync('src/app/settings/actions.ts', actions, 'utf8');

let page = fs.readFileSync('src/app/settings/page.tsx', 'utf8');
page = page.replace('import { getSettingsData, updateServiceItemPrice, updateSmsTemplate } from "./actions";', 'import { getSettingsData, updateServiceItemPrice, updateSmsTemplate, updatePassword } from "./actions";');
page = page.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [newPassword, setNewPassword] = useState("");');

const passwordSection = `
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">Mein Passwort ändern</h3>
              <div className="flex gap-4 items-center">
                <input 
                  type="password" 
                  placeholder="Neues Passwort eingeben..."
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="flex-1 border border-blue-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={async () => {
                    if (newPassword.length < 5) return toast.error("Passwort zu kurz!");
                    const admin = data.users.find(u => u.role === "ADMIN");
                    if (!admin) return;
                    const res = await updatePassword(admin.id, newPassword);
                    if (res.success) {
                      toast.success("Passwort erfolgreich geändert!");
                      setNewPassword("");
                    } else toast.error("Fehler beim Ändern.");
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
`;

page = page.replace(
  '<p className="text-gray-500 text-sm mt-1">Verwalte die Zugänge zum CRM-System.</p>\n              </div>\n              <button',
  '<p className="text-gray-500 text-sm mt-1">Verwalte die Zugänge zum CRM-System.</p>\n              </div>\n              <button'
);

page = page.replace(
  '<table className="w-full text-left text-sm">',
  passwordSection + '\n            <table className="w-full text-left text-sm">'
);

fs.writeFileSync('src/app/settings/page.tsx', page, 'utf8');
