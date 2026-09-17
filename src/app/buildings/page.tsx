"use client";

import { useEffect, useState } from "react";
import { getBuildings } from "./actions";
import { Building2, Search, Star, Filter } from "lucide-react";
import Link from "next/link";

type BuildingData = Awaited<ReturnType<typeof getBuildings>>[0];

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Alle");
  const [techFilter, setTechFilter] = useState("Alle");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const data = await getBuildings();
    setBuildings(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredBuildings = buildings.filter(b => {
    // Textsuche
    if (search) {
      const q = search.toLowerCase();
      const fullAddress = `${b.street} ${b.houseNumber} ${b.zipCode} ${b.city}`.toLowerCase();
      const matches = 
        fullAddress.includes(q) ||
        b.displayNumber.toLowerCase().includes(q) ||
        (b.owner || "").toLowerCase().includes(q) ||
        (b.propertyManagement || "").toLowerCase().includes(q) ||
        (b.dpuSiteCode || "").toLowerCase().includes(q) ||
        (b.caretaker || "").toLowerCase().includes(q);
      if (!matches) return false;
    }
    // Status-Filter
    if (statusFilter !== "Alle") {
      const statusMap: Record<string, string> = { "🟢 Unauffällig": "GREEN", "🟡 Aufmerksamkeit": "YELLOW", "🔴 Kritisch": "RED" };
      if (b.objectStatus !== statusMap[statusFilter]) return false;
    }
    // Technologie-Filter
    if (techFilter !== "Alle") {
      if (b.technology !== techFilter) return false;
    }
    // Favoriten
    if (showFavoritesOnly && !b.isFavorite) return false;
    return true;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case "GREEN": return "🟢";
      case "YELLOW": return "🟡";
      case "RED": return "🔴";
      default: return "⚪";
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Lade Objekte...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <Building2 className="w-8 h-8 text-blue-600" />
          Objekte
        </h1>
        <span className="text-sm text-gray-500">{filteredBuildings.length} von {buildings.length} Objekten</span>
      </div>

      {/* Filter-Leiste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Suchfeld */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen (Adresse, OBJ-Nr, Eigentümer, HTP-Kennung...)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Status-Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="Alle">Alle Statusse</option>
            <option value="🟢 Unauffällig">🟢 Unauffällig</option>
            <option value="🟡 Aufmerksamkeit">🟡 Aufmerksamkeit</option>
            <option value="🔴 Kritisch">🔴 Kritisch</option>
          </select>

          {/* Technologie-Filter */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="Alle">Alle Technologien</option>
            <option value="FTTB">FTTB</option>
            <option value="FTTH">FTTH</option>
            <option value="COPPER">Kupfer</option>
            <option value="MIXED">Gemischt</option>
          </select>

          {/* Favoriten-Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFavoritesOnly 
                ? "bg-amber-50 border-amber-300 text-amber-700" 
                : "border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-amber-400 text-amber-400" : ""}`} />
            Favoriten
          </button>
        </div>
      </div>

      {/* Tabelle */}
      {filteredBuildings.length === 0 ? (
        <div className="bg-white p-12 text-center border rounded-xl text-gray-500">
          {buildings.length === 0 
            ? "Noch keine Objekte vorhanden. Objekte werden automatisch bei der Abrechnung erstellt."
            : "Keine Objekte gefunden."}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8"></th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8"></th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">OBJ-Nr</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Adresse</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Eigentümer / HV</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Technologie</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">WE</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Einträge</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Letzter Einsatz</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                  {/* Ampel */}
                  <td className="px-4 py-3 text-center">{statusIcon(b.objectStatus)}</td>
                  {/* Favorit */}
                  <td className="px-4 py-3 text-center">
                    {b.isFavorite && <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />}
                  </td>
                  {/* OBJ-Nr */}
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">{b.displayNumber}</td>
                  {/* Adresse */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{b.street} {b.houseNumber}</div>
                    <div className="text-xs text-gray-500">{b.zipCode} {b.city}</div>
                  </td>
                  {/* Eigentümer / HV */}
                  <td className="px-4 py-3 text-gray-600">
                    {b.owner || b.propertyManagement || <span className="text-gray-300">–</span>}
                  </td>
                  {/* Technologie */}
                  <td className="px-4 py-3">
                    {b.technology ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {b.technology}
                      </span>
                    ) : <span className="text-gray-300">–</span>}
                  </td>
                  {/* WE */}
                  <td className="px-4 py-3 text-center text-gray-600">
                    {b.unitCount || <span className="text-gray-300">–</span>}
                  </td>
                  {/* Einträge */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium">
                      {b.entryCount > 0 && <span className="text-blue-600">{b.entryCount} Vermerke</span>}
                      {b.entryCount > 0 && b.photoCount > 0 && " · "}
                      {b.photoCount > 0 && <span className="text-green-600">{b.photoCount} Fotos</span>}
                      {b.entryCount === 0 && b.photoCount === 0 && <span className="text-gray-300">–</span>}
                    </span>
                  </td>
                  {/* Letzter Einsatz */}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {b.lastVisitAt 
                      ? new Date(b.lastVisitAt).toLocaleDateString("de-DE") 
                      : <span className="text-gray-300">–</span>}
                  </td>
                  {/* Aktionen */}
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/buildings/${b.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Akte &gt;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
