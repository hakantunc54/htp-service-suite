"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getBuildingById,
  updateBuildingGeneral,
  updateBuildingTech,
  updateBuildingStatus,
  updateBuildingNotes,
  addBuildingEntry,
  toggleBuildingFavorite,
} from "../actions";
import { formatObjectNumber } from "@/lib/normalizeAddress";
import {
  Building2, ArrowLeft, Star, Save, Plus, Trash2, Upload,
  ClipboardList, Zap, History, Camera, FileText, AlertTriangle, X
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type BuildingData = NonNullable<Awaited<ReturnType<typeof getBuildingById>>>;
type TabId = "general" | "tech" | "history" | "photos" | "notes";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "general", label: "Allgemein", icon: ClipboardList },
  { id: "tech", label: "Technik", icon: Zap },
  { id: "history", label: "Historie", icon: History },
  { id: "photos", label: "Fotos", icon: Camera },
  { id: "notes", label: "Notizen", icon: FileText },
];

const PHOTO_CATEGORIES = [
  { value: "DPU", label: "DPU" },
  { value: "DSLAM", label: "DSLAM" },
  { value: "GFUEP", label: "Gf-ÜP" },
  { value: "APL", label: "APL" },
  { value: "LSA", label: "LSA / Mini-Verteiler" },
  { value: "TECH_ROOM", label: "Technikraum" },
  { value: "LABEL", label: "Beschriftung" },
  { value: "CABINET", label: "Schaltschrank" },
  { value: "OTHER", label: "Sonstiges" },
];

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.id as string;

  const [building, setBuilding] = useState<BuildingData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulardaten
  const [general, setGeneral] = useState<any>({});
  const [tech, setTech] = useState<any>({});
  const [notes, setNotes] = useState("");
  const [statusAmpel, setStatusAmpel] = useState("GREEN");
  const [statusNote, setStatusNote] = useState("");

  // Neuer Vermerk
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ remark: "", customerName: "", orderType: "", apartmentLocation: "", apartmentCode: "" });

  // Foto-Upload
  const [photoCategory, setPhotoCategory] = useState("OTHER");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFilter, setPhotoFilter] = useState("Alle");
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const data = await getBuildingById(buildingId);
    if (!data) { router.push("/buildings"); return; }
    setBuilding(data);
    setGeneral({
      owner: data.owner || "", propertyManagement: data.propertyManagement || "",
      caretaker: data.caretaker || "", caretakerPhone: data.caretakerPhone || "",
      contactPerson: data.contactPerson || "", contactPhone: data.contactPhone || "",
      primaryContact: data.primaryContact || "", primaryContactPhone: data.primaryContactPhone || "",
      primaryContactRole: data.primaryContactRole || "",
    });
    setTech({
      dpuSiteCode: data.dpuSiteCode || "", dpuIpAddress: data.dpuIpAddress || "",
      dpuLocation: data.dpuLocation || "", dpuManufacturer: data.dpuManufacturer || "",
      dpuSerialNumber: data.dpuSerialNumber || "", dpuCount: data.dpuCount || "",
      dslamLocation: data.dslamLocation || "", fiberHandoverPoint: data.fiberHandoverPoint || "",
      aplLocation: data.aplLocation || "", lsaLocation: data.lsaLocation || "",
      cablingNotes: data.cablingNotes || "", techRoomAccess: data.techRoomAccess || "",
      keyInfo: data.keyInfo || "", unitCount: data.unitCount || "",
      technology: data.technology || "",
    });
    setNotes(data.notes || "");
    setStatusAmpel(data.objectStatus);
    setStatusNote(data.objectStatusNote || "");
    setLoading(false);
  }, [buildingId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    await updateBuildingGeneral(buildingId, general);
    toast.success("Allgemeine Infos gespeichert");
    setSaving(false);
    fetchData();
  };

  const handleSaveTech = async () => {
    setSaving(true);
    await updateBuildingTech(buildingId, {
      ...tech,
      dpuCount: tech.dpuCount ? parseInt(tech.dpuCount) : null,
      unitCount: tech.unitCount ? parseInt(tech.unitCount) : null,
      technology: tech.technology || null,
    });
    toast.success("Technische Infos gespeichert");
    setSaving(false);
    fetchData();
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    await updateBuildingStatus(buildingId, statusAmpel as any, statusNote);
    toast.success("Objektstatus aktualisiert");
    setSaving(false);
    fetchData();
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await updateBuildingNotes(buildingId, notes);
    toast.success("Notizen gespeichert");
    setSaving(false);
  };

  const handleAddEntry = async () => {
    if (!newEntry.remark.trim()) { toast.error("Bitte einen Vermerk eingeben"); return; }
    setSaving(true);
    await addBuildingEntry(buildingId, {
      remark: newEntry.remark,
      customerName: newEntry.customerName || undefined,
      orderType: newEntry.orderType || undefined,
      apartmentLocation: newEntry.apartmentLocation || undefined,
      apartmentCode: newEntry.apartmentCode || undefined,
    });
    setNewEntry({ remark: "", customerName: "", orderType: "", apartmentLocation: "", apartmentCode: "" });
    setShowNewEntry(false);
    toast.success("Vermerk hinzugefügt");
    setSaving(false);
    fetchData();
  };

  const handleToggleFavorite = async () => {
    await toggleBuildingFavorite(buildingId);
    fetchData();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !building) return;
    setSaving(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("buildingId", buildingId);
      formData.append("objectNumber", building.displayNumber);
      formData.append("category", photoCategory);
      if (photoCaption) formData.append("caption", photoCaption);
      await fetch("/api/building-photos", { method: "POST", body: formData });
    }
    setPhotoCaption("");
    toast.success("Foto(s) hochgeladen");
    setSaving(false);
    fetchData();
    e.target.value = "";
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Foto wirklich löschen?")) return;
    await fetch("/api/building-photos", {
      method: "DELETE",
      body: JSON.stringify({ photoId }),
    });
    toast.success("Foto gelöscht");
    fetchData();
  };

  if (loading || !building) return <div className="p-8 text-gray-500">Lade Objektakte...</div>;

  const statusColors: Record<string, string> = {
    GREEN: "bg-green-50 border-green-200 text-green-800",
    YELLOW: "bg-amber-50 border-amber-200 text-amber-800",
    RED: "bg-red-50 border-red-200 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    GREEN: "🟢 Unauffällig",
    YELLOW: "🟡 Aufmerksamkeit erforderlich",
    RED: "🔴 Kritisches Objekt",
  };

  const filteredPhotos = building.photos.filter(p =>
    photoFilter === "Alle" || p.category === photoFilter
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Zurück-Button */}
      <button onClick={() => router.push("/buildings")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-4 text-sm">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Objektliste
      </button>

      {/* Header */}
      <div className={`rounded-xl border-2 p-6 mb-6 ${statusColors[building.objectStatus]}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-7 h-7" />
              <span className="font-mono text-lg font-bold">{building.displayNumber}</span>
              <button onClick={handleToggleFavorite} title="Favorit" className="hover:scale-110 transition-transform">
                <Star className={`w-5 h-5 ${building.isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-400"}`} />
              </button>
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {building.street} {building.houseNumber}, {building.zipCode} {building.city}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium">{statusLabels[building.objectStatus]}</span>
            </div>
            {building.objectStatusNote && (
              <p className="text-sm mt-1 italic">„{building.objectStatusNote}"</p>
            )}
          </div>
          {building.primaryContact && (
            <div className="text-right bg-white/60 rounded-lg px-4 py-2">
              <div className="text-xs font-bold uppercase text-gray-500">⭐ Hauptansprechpartner</div>
              <div className="font-semibold">{building.primaryContact}</div>
              {building.primaryContactRole && <div className="text-xs text-gray-600">{building.primaryContactRole}</div>}
              {building.primaryContactPhone && (
                <a href={`tel:${building.primaryContactPhone}`} className="text-sm font-medium text-blue-600 hover:underline">
                  {building.primaryContactPhone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Statusampel ändern */}
        <div className="mt-4 pt-4 border-t border-current/10 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold">Status:</span>
          {(["GREEN", "YELLOW", "RED"] as const).map(s => (
            <button key={s} onClick={() => setStatusAmpel(s)}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                statusAmpel === s ? "ring-2 ring-offset-1 ring-current" : "opacity-60 hover:opacity-100"
              }`}>
              {statusLabels[s]}
            </button>
          ))}
          {statusAmpel !== "GREEN" && (
            <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
              placeholder="Begründung..." className="flex-1 text-xs px-3 py-1 rounded-lg border bg-white/80" />
          )}
          {(statusAmpel !== building.objectStatus || statusNote !== (building.objectStatusNote || "")) && (
            <button onClick={handleSaveStatus} disabled={saving}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Speichern
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
              {tab.id === "history" && building.entries.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">{building.entries.length}</span>
              )}
              {tab.id === "photos" && building.photos.length > 0 && (
                <span className="bg-green-100 text-green-700 text-xs px-1.5 rounded-full">{building.photos.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab-Inhalte */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

        {/* ═══ TAB: Allgemein ═══ */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Allgemeine Objektinformationen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "owner", label: "Eigentümer" },
                { key: "propertyManagement", label: "Hausverwaltung" },
                { key: "caretaker", label: "Hausmeister" },
                { key: "caretakerPhone", label: "Telefon Hausmeister" },
                { key: "contactPerson", label: "Ansprechpartner" },
                { key: "contactPhone", label: "Telefon Ansprechpartner" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{f.label}</label>
                  <input value={general[f.key] || ""} onChange={e => setGeneral({ ...general, [f.key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-bold text-gray-700 mb-3">⭐ Hauptansprechpartner</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Name</label>
                  <input value={general.primaryContact || ""} onChange={e => setGeneral({ ...general, primaryContact: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Telefon</label>
                  <input value={general.primaryContactPhone || ""} onChange={e => setGeneral({ ...general, primaryContactPhone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Rolle</label>
                  <input value={general.primaryContactRole || ""} onChange={e => setGeneral({ ...general, primaryContactRole: e.target.value })}
                    placeholder="z.B. Hausmeister, Eigentümer"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </div>

            <button onClick={handleSaveGeneral} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> Speichern
            </button>
          </div>
        )}

        {/* ═══ TAB: Technik ═══ */}
        {activeTab === "tech" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-800">Technische Informationen</h2>

            {/* DPU-Bereich hervorgehoben */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-md font-bold text-blue-800 mb-3">📡 DPU</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">HTP-Standortkennung</label>
                  <input value={tech.dpuSiteCode} onChange={e => setTech({ ...tech, dpuSiteCode: e.target.value })}
                    placeholder="z.B. WED002Z101/E1"
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm font-mono font-bold bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">IP-Adresse</label>
                  <input value={tech.dpuIpAddress} onChange={e => setTech({ ...tech, dpuIpAddress: e.target.value })}
                    placeholder="z.B. 192.168.100.10"
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm font-mono bg-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-blue-600 uppercase">Standort</label>
                  <input value={tech.dpuLocation} onChange={e => setTech({ ...tech, dpuLocation: e.target.value })}
                    placeholder="z.B. Keller links neben Stromhauptverteilung"
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">Hersteller</label>
                  <input value={tech.dpuManufacturer} onChange={e => setTech({ ...tech, dpuManufacturer: e.target.value })}
                    placeholder="z.B. Nokia, Huawei"
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">Seriennummer</label>
                  <input value={tech.dpuSerialNumber} onChange={e => setTech({ ...tech, dpuSerialNumber: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm font-mono bg-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-600 uppercase">Anzahl DPUs</label>
                  <input type="number" value={tech.dpuCount} onChange={e => setTech({ ...tech, dpuCount: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-lg text-sm bg-white" />
                </div>
              </div>
            </div>

            {/* Weitere Infrastruktur */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "dslamLocation", label: "DSLAM / T-SLAM" },
                { key: "fiberHandoverPoint", label: "Gf-ÜP (Glasfaserübergabepunkt)" },
                { key: "aplLocation", label: "Telekom-APL" },
                { key: "lsaLocation", label: "LSA / Mini-Verteiler" },
                { key: "cablingNotes", label: "Gebäudeverkabelung" },
                { key: "techRoomAccess", label: "Technikraum-Zugang" },
                { key: "keyInfo", label: "Schlüssel- / Zugangshinweise" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-500 uppercase">{f.label}</label>
                  <input value={tech[f.key] || ""} onChange={e => setTech({ ...tech, [f.key]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              ))}
            </div>

            {/* Gebäudedaten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Wohneinheiten</label>
                <input type="number" value={tech.unitCount} onChange={e => setTech({ ...tech, unitCount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Technologie</label>
                <select value={tech.technology} onChange={e => setTech({ ...tech, technology: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                  <option value="">– nicht festgelegt –</option>
                  <option value="FTTB">FTTB</option>
                  <option value="FTTH">FTTH</option>
                  <option value="COPPER">Kupfer</option>
                  <option value="MIXED">Gemischt</option>
                </select>
              </div>
            </div>

            <button onClick={handleSaveTech} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> Speichern
            </button>
          </div>
        )}

        {/* ═══ TAB: Historie ═══ */}
        {activeTab === "history" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Einsatzhistorie</h2>
              <button onClick={() => setShowNewEntry(!showNewEntry)}
                className="flex items-center gap-1 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Vermerk hinzufügen
              </button>
            </div>

            {showNewEntry && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input value={newEntry.customerName} onChange={e => setNewEntry({ ...newEntry, customerName: e.target.value })}
                    placeholder="Kundenname (optional)" className="px-3 py-2 border rounded-lg text-sm" />
                  <input value={newEntry.orderType} onChange={e => setNewEntry({ ...newEntry, orderType: e.target.value })}
                    placeholder="Auftragstyp (optional)" className="px-3 py-2 border rounded-lg text-sm" />
                  <input value={newEntry.apartmentLocation} onChange={e => setNewEntry({ ...newEntry, apartmentLocation: e.target.value })}
                    placeholder="WE-Lage (optional)" className="px-3 py-2 border rounded-lg text-sm" />
                  <input value={newEntry.apartmentCode} onChange={e => setNewEntry({ ...newEntry, apartmentCode: e.target.value })}
                    placeholder="WE-Code (optional)" className="px-3 py-2 border rounded-lg text-sm" />
                </div>
                <textarea value={newEntry.remark} onChange={e => setNewEntry({ ...newEntry, remark: e.target.value })}
                  placeholder="Vermerk *" rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleAddEntry} disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    Speichern
                  </button>
                  <button onClick={() => setShowNewEntry(false)}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {building.entries.length === 0 ? (
              <div className="text-center text-gray-400 py-12">Noch keine Einträge vorhanden.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Datum</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Kunde</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Auftragstyp</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">WE-Lage</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">WE-Code</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Bemerkung</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-600">Typ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {building.entries.map(entry => (
                      <tr key={entry.id} className={`border-b border-gray-100 ${entry.isAutomatic ? "text-gray-400" : ""}`}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString("de-DE")}
                        </td>
                        <td className="px-3 py-2">{entry.customerName || <span className="text-gray-300">–</span>}</td>
                        <td className="px-3 py-2">{entry.orderType || <span className="text-gray-300">–</span>}</td>
                        <td className="px-3 py-2">{entry.apartmentLocation || <span className="text-gray-300">–</span>}</td>
                        <td className="px-3 py-2 font-mono text-xs">{entry.apartmentCode || <span className="text-gray-300">–</span>}</td>
                        <td className="px-3 py-2 max-w-xs truncate">{entry.remark}</td>
                        <td className="px-3 py-2 text-center">{entry.isAutomatic ? "🤖" : "✏️"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Fotos ═══ */}
        {activeTab === "photos" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Fotodokumentation</h2>

            {/* Upload */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 mb-6">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-xs font-bold text-gray-500">Kategorie</label>
                  <select value={photoCategory} onChange={e => setPhotoCategory(e.target.value)}
                    className="block mt-1 px-3 py-2 border rounded-lg text-sm bg-white">
                    {PHOTO_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-bold text-gray-500">Beschriftung (optional)</label>
                  <input value={photoCaption} onChange={e => setPhotoCaption(e.target.value)}
                    placeholder="z.B. DPU Keller Haus A"
                    className="block w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                  <Upload className="w-4 h-4" /> Foto hochladen
                  <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Filter */}
            {building.photos.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setPhotoFilter("Alle")}
                  className={`text-xs px-3 py-1 rounded-full border ${photoFilter === "Alle" ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                  Alle ({building.photos.length})
                </button>
                {PHOTO_CATEGORIES.filter(c => building.photos.some(p => p.category === c.value)).map(c => (
                  <button key={c.value} onClick={() => setPhotoFilter(c.value)}
                    className={`text-xs px-3 py-1 rounded-full border ${photoFilter === c.value ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                    {c.label} ({building.photos.filter(p => p.category === c.value).length})
                  </button>
                ))}
              </div>
            )}

            {/* Galerie */}
            {filteredPhotos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">Noch keine Fotos vorhanden.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map(photo => (
                  <div key={photo.id} className="relative group border rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={`/api/building-photos?path=${encodeURIComponent(photo.filename)}`}
                      alt={photo.caption || "Foto"}
                      className="w-full h-40 object-cover cursor-pointer"
                      onClick={() => setLightboxPhoto(photo.filename)}
                    />
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-700 truncate">{photo.caption || "Ohne Beschriftung"}</div>
                      <div className="text-xs text-gray-400">
                        {PHOTO_CATEGORIES.find(c => c.value === photo.category)?.label || "Sonstiges"}
                        {" · "}{new Date(photo.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                    <button onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Lightbox */}
            {lightboxPhoto && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
                onClick={() => setLightboxPhoto(null)}>
                <button className="absolute top-4 right-4 text-white" onClick={() => setLightboxPhoto(null)}>
                  <X className="w-8 h-8" />
                </button>
                <img src={`/api/building-photos?path=${encodeURIComponent(lightboxPhoto)}`}
                  alt="Vergrößerung" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: Notizen ═══ */}
        {activeTab === "notes" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Objektnotizen</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={"Besonderheiten vor Ort\nZugangshinweise\nHinweise des Hausmeisters\nBekannte Störungen\nGeplante Arbeiten\nErfahrungen aus vorherigen Einsätzen"}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
            />
            <button onClick={handleSaveNotes} disabled={saving}
              className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> Notizen speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
