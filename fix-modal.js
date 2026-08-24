const fs = require('fs');
let code = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Add states for modal
code = code.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [passwordModalOpen, setPasswordModalOpen] = useState(false);\n  const [passwordModalUser, setPasswordModalUser] = useState({ id: "", name: "" });\n  const [newPassword, setNewPassword] = useState("");'
);

// Replace prompt handler
code = code.replace(
  /const handlePasswordChange = async \(userId: string, userName: string\) => \{[\s\S]*?^\s*\};\n/m,
  `const handlePasswordChangeClick = (userId: string, userName: string) => {
    setPasswordModalUser({ id: userId, name: userName });
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const submitPasswordChange = async () => {
    if (newPassword.length < 5) return toast.error("Passwort zu kurz! (Mindestens 5 Zeichen)");
    const res = await updatePassword(passwordModalUser.id, newPassword);
    if (res.success) {
      toast.success(\`Passwort für \${passwordModalUser.name} erfolgreich geändert!\`);
      setPasswordModalOpen(false);
    } else {
      toast.error("Fehler beim Ändern.");
    }
  };
`
);

// Update button onClick
code = code.replace(
  'onClick={() => handlePasswordChange(user.id, user.name)}',
  'onClick={() => handlePasswordChangeClick(user.id, user.name)}'
);

// Add Modal JSX at the end of the return statement
const modalJsx = `
      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Passwort ändern
              </h2>
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ?
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Neues Passwort für <strong>{passwordModalUser.name}</strong> festlegen:
              </p>
              <input 
                type="password"
                placeholder="Neues Passwort (mind. 5 Zeichen)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={submitPasswordChange}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  Passwort speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /    <\/div>\n  \);\n\}\n$/,
  modalJsx + '    </div>\n  );\n}\n'
);

fs.writeFileSync('src/app/settings/page.tsx', code, 'utf8');
