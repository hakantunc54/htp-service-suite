"use client";

import { useEffect, useState } from "react";
import { getSettingsData, updateServiceItemPrice, updateSmsTemplate, updatePassword } from "./actions";
import { Settings, Users, Calculator, MessageSquare, Save, Plus, Edit2 } from "lucide-react";
import { toast } from "sonner";

type SettingsData = Awaited<ReturnType<typeof getSettingsData>>;

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "sms" | "users" | "database">("catalog");
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState({ id: "", name: "" });
  const [newPassword, setNewPassword] = useState("");

  // Local state for edits
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [smsTexts, setSmsTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getSettingsData();
    setData(res);
    
    const p: Record<string, number> = {};
    res.serviceItems.forEach(s => p[s.id] = s.defaultPrice || 0);
    setPrices(p);

    const s: Record<string, string> = {};
    res.smsTemplates.forEach(t => s[t.id] = t.content);
    setSmsTexts(s);
    
    setLoading(false);
  };

  const handleSavePrice = async (id: string) => {
    const res = await updateServiceItemPrice(id, prices[id]);
    if (res.success) {
      toast.success("Preis erfolgreich aktualisiert!");
    } else {
      toast.error("Fehler: " + res.error);
    }
  };

  
  const handlePasswordChangeClick = (userId: string, userName: string) => {
    setPasswordModalUser({ id: userId, name: userName });
    setNewPassword("");
    setPasswordModalOpen(true);
  };

  const submitPasswordChange = async () => {
    if (newPassword.length < 5) return toast.error("Passwort zu kurz! (Mindestens 5 Zeichen)");
    const res = await updatePassword(passwordModalUser.id, newPassword);
    if (res.success) {
      toast.success(`Passwort f�r ${passwordModalUser.name} erfolgreich ge�ndert!`);
      setPasswordModalOpen(false);
    } else {
      toast.error("Fehler beim �ndern.");
    }
  };

  const handleSaveSms = async (id: string) => {
    const res = await updateSmsTemplate(id, smsTexts[id]);
    if (res.success) {
      toast.success("SMS-Vorlage gespeichert!");
    } else {
      toast.error("Fehler: " + res.error);
    }
  };

  if (loading || !data) return <div className="p-8 text-center text-gray-500">Lade Einstellungen...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Settings className="w-8 h-8 text-slate-800" />
        Einstellungen & Control Center
      </h1>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("catalog")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "catalog" ? "bg-slate-800 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <Calculator className="w-5 h-5" /> Leistungskatalog
        </button>
        <button 
          onClick={() => setActiveTab("sms")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "sms" ? "bg-slate-800 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <MessageSquare className="w-5 h-5" /> SMS Vorlagen
        </button>
        
        <button 
          onClick={() => setActiveTab("database")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "database" ? "bg-slate-800 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <Database className="w-5 h-5" /> Datenbank
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "users" ? "bg-slate-800 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <Users className="w-5 h-5" /> Benutzer & Team
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === "catalog" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">Leistungskatalog & Standardpreise</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Hier kannst du die Basispreise für alle HTP-Positionen anpassen. Änderungen gelten sofort für alle neuen Abrechnungen.
            </p>
            <div className="overflow-x-auto">
              
            <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-500">
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Kategorie</th>
                    <th className="px-4 py-3 font-medium">Standard-Preis (€)</th>
                    <th className="px-4 py-3 font-medium text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.serviceItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={prices[item.id] || 0}
                          onChange={(e) => setPrices({...prices, [item.id]: parseFloat(e.target.value) || 0})}
                          className="border border-gray-300 rounded px-2 py-1 w-24 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded transition-colors"
                          title="Speichern"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "sms" && (
          <div className="animate-in fade-in">
            <h2 className="text-xl font-bold mb-4">SMS Vorlagen</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Diese Texte werden verwendet, wenn du einem Kunden eine SMS schickst. Du kannst den Platzhalter [KUNDENNAME] verwenden, dieser wird automatisch durch den echten Namen ersetzt.
            </p>
            <div className="space-y-6">
              {data.smsTemplates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">{template.name}</h3>
                    <button
                      onClick={() => handleSaveSms(template.id)}
                      className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" /> Speichern
                    </button>
                  </div>
                  <textarea
                    value={smsTexts[template.id] || ""}
                    onChange={(e) => setSmsTexts({...smsTexts, [template.id]: e.target.value})}
                    className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                  />
                </div>
              ))}
              {data.smsTemplates.length === 0 && (
                <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
                  Noch keine SMS-Vorlagen in der Datenbank angelegt. (Führe reset_testdaten.js aus, um sie zu generieren)
                </div>
              )}
            </div>
          </div>
        )}

        
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

        {activeTab === "users" && (
          <div className="animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Benutzer & Team</h2>
                <p className="text-gray-500 text-sm mt-1">Verwalte die Zugänge zum CRM-System.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                <Plus className="w-4 h-4" /> Benutzer anlegen
              </button>
            </div>
            
            

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-gray-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">E-Mail (Login)</th>
                  <th className="px-4 py-3 font-medium">Rolle</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-bold text-gray-900">{user.name}</td>
                    <td className="px-4 py-4 text-gray-600">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right flex items-center justify-end gap-3">
                      <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">Aktiv</span>
                      <button 
                        onClick={() => handlePasswordChangeClick(user.id, user.name)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Passwort ändern"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      (Noch keine Benutzer angelegt. Das System läuft komplett offen.)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                ✕
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

    </div>
  );
}
