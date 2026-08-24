const fs = require('fs');
let code = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

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
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '    </div>\n  );\n}',
  modalJsx + '\n    </div>\n  );\n}'
);

// Fallback if not found:
if (!code.includes('Password Change Modal')) {
  let idx = code.lastIndexOf('</div>');
  code = code.substring(0, idx) + modalJsx + code.substring(idx);
}

fs.writeFileSync('src/app/settings/page.tsx', code, 'utf8');
