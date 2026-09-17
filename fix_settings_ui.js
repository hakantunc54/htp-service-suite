const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Add imports for the new actions
content = content.replace(
  /import \{ getSettingsData, updateServiceItemPrice, updateSmsTemplate, updatePassword \} from "\.\/actions";/,
  'import { getSettingsData, updateServiceItemPrice, updateSmsTemplate, updatePassword, wipeDatabase, restoreDatabase } from "./actions";'
);

// Add state variables
content = content.replace(
  /const \[passwordModalUser, setPasswordModalUser\] = useState\(\{ id: "", name: "" \}\);/,
  `const [passwordModalUser, setPasswordModalUser] = useState({ id: "", name: "" });
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeText, setWipeText] = useState("");
  const [isWiping, setIsWiping] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restarting, setRestarting] = useState(false);`
);

// Add handler functions
const handlers = `
  const handleWipe = async () => {
    if (wipeText !== "LOESCHEN") {
      toast.error("Bitte exakt LOESCHEN eingeben.");
      return;
    }
    setIsWiping(true);
    try {
      await wipeDatabase();
      toast.success("Datenbank erfolgreich geloescht!");
      setWipeModalOpen(false);
      setWipeText("");
    } catch (e) {
      toast.error("Fehler beim Loeschen.");
    }
    setIsWiping(false);
  };

  const handleRestore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRestoring(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await restoreDatabase(formData);
      if (res.success) {
        toast.success("Backup wiederhergestellt! Server startet neu...");
        setRestarting(true);
        await fetch("/api/restart", { method: "POST" });
        // Reload page after 5 seconds to give docker time to restart
        setTimeout(() => window.location.href = "/", 5000);
      } else {
        toast.error(res.error || "Fehler beim Wiederherstellen");
      }
    } catch (e) {
      toast.error("Fehler beim Upload.");
    }
    setIsRestoring(false);
  };
`;
content = content.replace(/const submitPasswordChange = async \(\) => \{/, handlers + '\n  const submitPasswordChange = async () => {');


// Replace the database tab content
const oldDbTab = /{activeTab === "database" && \([\s\S]*?(?=\{activeTab === "users")/
const newDbTab = `{activeTab === "database" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Datenbank-Verwaltung</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Hier kannst du Sicherheitskopien der Datenbank herunterladen, alte Backups wiederherstellen oder das System komplett zuruecksetzen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-200 bg-green-50 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-green-100 opacity-50 group-hover:scale-110 transition-transform">
                  <Database className="w-32 h-32" />
                </div>
                <h3 className="font-bold text-green-900 mb-2 relative z-10">1. Backup herunterladen</h3>
                <p className="text-green-800 text-sm mb-6 relative z-10">
                  Sichere die aktuelle Datenbank auf deinem PC. Dies ist eine exakte Kopie aller Kunden, Auftraege und Einstellungen.
                </p>
                <a 
                  href="/api/db-backup"
                  download="htp_suite_backup.db"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm relative z-10"
                >
                  <Save className="w-4 h-4" /> Backup herunterladen
                </a>
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 relative">
                <h3 className="font-bold text-blue-900 mb-2">2. Backup wiederherstellen</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Lade eine zuvor gesicherte .db Datei hoch, um das System auf diesen Stand zurueckzusetzen. Das System startet danach automatisch neu.
                </p>
                <form onSubmit={handleRestore} className="flex flex-col gap-3">
                  <input type="file" name="db_file" accept=".db" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"/>
                  <button disabled={isRestoring || restarting} type="submit" className="bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition-colors w-fit flex items-center gap-2 shadow-sm">
                    {isRestoring ? "Wiederherstellen..." : restarting ? "Neustart..." : "Backup einspielen"}
                  </button>
                </form>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-xl p-6 md:col-span-2 mt-4 relative overflow-hidden">
                <h3 className="font-bold text-red-900 mb-2 text-lg">Gefahrenzone: Datenbank loeschen (Wipe)</h3>
                <p className="text-red-800 text-sm mb-6">
                  Loescht ALLE Auftraege, Kunden und Historien aus der Datenbank. Nur die Einstellungen (Preise) bleiben erhalten. Dies kann NICHT rueckgaengig gemacht werden.
                </p>
                <button 
                  onClick={() => setWipeModalOpen(true)}
                  className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  DATENBANK WIPE AUSFUEHREN
                </button>
              </div>
            </div>
          </div>
        )}
        `;
content = content.replace(oldDbTab, newDbTab);

// Add Modals at the bottom
const modals = `
      {/* Wipe Modal */}
      {wipeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Achtung: System-Wipe
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-800 font-medium mb-2">
                Bist du dir ABSOLUT SICHER?
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Dieser Vorgang loescht alle Auftraege und Kunden unwiderruflich. Bitte tippe zur Bestaetigung das Wort <strong>LOESCHEN</strong> in das Feld ein.
              </p>
              <input 
                type="text"
                placeholder="LOESCHEN"
                value={wipeText}
                onChange={e => setWipeText(e.target.value)}
                className="w-full border-2 border-red-100 focus:border-red-500 rounded-xl px-4 py-3 outline-none mb-6 text-center font-bold tracking-widest uppercase"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => { setWipeModalOpen(false); setWipeText(""); }}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Abbrechen
                </button>
                <button 
                  disabled={wipeText !== "LOESCHEN" || isWiping}
                  onClick={handleWipe}
                  className="px-5 py-2.5 bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  {isWiping ? "Wird geloescht..." : "Endgueltig loeschen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restarting Overlay */}
      {restarting && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in text-white">
          <Database className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2">System wird neu gestartet</h2>
          <p className="text-slate-300">Die neue Datenbank wird geladen. Du wirst in wenigen Sekunden automatisch weitergeleitet...</p>
        </div>
      )}
`;
content = content.replace(/<\/div>\s*$/m, modals + '\n    </div>\n  );\n}\n');

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Settings UI redesigned.");
