const fs = require('fs');
let content = fs.readFileSync('src/app/settings/page.tsx', 'utf8');

// Add "database" tab button
content = content.replace(
  /<button\s+onClick=\{\(\) => setActiveTab\("users"\)\}\s+className=\{`px-6 py-4 font-medium text-sm transition-colors \$\{activeTab === "users"/,
  `<button 
          onClick={() => setActiveTab("database")}
          className={\`px-6 py-4 font-medium text-sm transition-colors \${activeTab === "database" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}\`}
        >
          Datenbank
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={\`px-6 py-4 font-medium text-sm transition-colors \${activeTab === "users"`
);

// Add "database" tab content
const dbTabContent = `
        {activeTab === "database" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Datenbank-Verwaltung</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Hier kannst du Sicherheitskopien der Datenbank herunterladen, alte Backups wiederherstellen oder das System komplett zuruecksetzen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-200 bg-green-50 rounded-xl p-6">
                <h3 className="font-bold text-green-900 mb-2">1. Backup herunterladen</h3>
                <p className="text-green-800 text-sm mb-4">
                  Sichere die aktuelle Datenbank auf deinem PC. Dies ist eine exakte Kopie aller Kunden, Auftraege und Einstellungen.
                </p>
                <a 
                  href="/api/db-backup"
                  download="htp_suite_backup.db"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Backup herunterladen
                </a>
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">2. Backup wiederherstellen</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Lade eine zuvor gesicherte .db Datei hoch, um das System auf diesen Stand zurueckzusetzen.
                </p>
                <form action="/api/db-restore" method="POST" encType="multipart/form-data" className="flex flex-col gap-3">
                  <input type="file" name="db_file" accept=".db" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                  <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition-colors w-fit">
                    Backup einspielen
                  </button>
                </form>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold text-red-900 mb-2 text-lg">Gefahrenzone: Datenbank loeschen (Wipe)</h3>
                <p className="text-red-800 text-sm mb-4">
                  Loescht ALLE Auftraege, Kunden und Historien aus der Datenbank. Nur die Einstellungen (Preise) bleiben erhalten. Dies kann NICHT rueckgaengig gemacht werden.
                </p>
                <form action="/api/db-wipe" method="POST" className="flex items-center gap-4" onSubmit={(e) => {
                  if(!confirm('Bist du dir ABSOLUT SICHER? Alles wird geloescht!')) e.preventDefault();
                }}>
                  <input type="text" name="confirm_text" placeholder="LOESCHEN tippen" required pattern="LOESCHEN" className="border border-red-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
                  <button type="submit" className="bg-red-600 text-white font-bold px-6 py-2 rounded hover:bg-red-700 transition-colors">
                    DATENBANK WIPE AUSFUEHREN
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
  /\{activeTab === "users" && \(/,
  dbTabContent + '\n        {activeTab === "users" && ('
);

fs.writeFileSync('src/app/settings/page.tsx', content, 'utf8');
console.log("Settings modified.");
