"use client";

import { useEffect, useState } from "react";
import { getOrdersForPlanning, assignVehicleToOrder, deleteOrder } from "./actions";
import { Vehicle } from "@/types";
import { Calendar, Download, Map, CarFront, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type OrderData = Awaited<ReturnType<typeof getOrdersForPlanning>>[0];

export default function PlanningPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getOrdersForPlanning();
    setOrders(data);
    setLoading(false);
  };

  const handleAssign = async (orderId: string, vehicle: string | null) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, vehicle } : o));
    const result = await assignVehicleToOrder(orderId, vehicle);
    if (result.success) {
      toast.success(vehicle ? `Dem ${vehicle} zugewiesen` : "Zuweisung aufgehoben");
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    const orderId = orderToDelete;
    
    // Optimistic UI update
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setOrderToDelete(null);
    
    const result = await deleteOrder(orderId);
    if (result.success) {
      toast.success("Auftrag erfolgreich gelöscht.");
    } else {
      toast.error("Fehler beim Löschen.");
      fetchData(); // rollback
    }
  };

  const handleExportCsv = (vehicleName?: string) => {
    // 1. Welche Aufträge sollen exportiert werden? (Spezielles Auto oder Alle Autos)
    let ordersToExport = vehicleName 
      ? orders.filter(o => o.vehicle === vehicleName)
      : orders.filter(o => [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3].includes(o.vehicle as any));
    
    // 2. Nur Aufträge von heute exportieren (oder Aufträge ganz ohne Fixtermin)
    const todayStr = new Date().toISOString().split('T')[0];
    ordersToExport = ordersToExport.filter(o => {
      if (!o.kundenTerminStart) return true; // Ohne Fixtermin (z.B. FTTB) darf mit
      return new Date(o.kundenTerminStart).toISOString().split('T')[0] === todayStr; // Mit Fixtermin nur wenn heute
    });

    if (ordersToExport.length === 0) {
      toast.error(`Keine heutigen Aufträge ${vehicleName ? `für ${vehicleName} ` : ''}gefunden.`);
      return;
    }

    // 3. Sortieren: Nach Auto (falls Alle exportiert werden), dann nach Termin
    ordersToExport.sort((a, b) => {
      if (a.vehicle !== b.vehicle) {
        return (a.vehicle || "").localeCompare(b.vehicle || "");
      }
      if (a.kundenTerminStart && b.kundenTerminStart) {
        return new Date(a.kundenTerminStart).getTime() - new Date(b.kundenTerminStart).getTime();
      }
      return 0;
    });

    // xRoute Header
    const header = [
      "Tour", "Postleitzahl", "Stadt", "Straße", "Hausnummer", 
      "Fahrer", "Port", "Ansprechpartner", "Kundennummer", 
      "Ansprechpartner Telefonnummer", "Notiz", "Name", 
      "Telefon", "Referenz", "Frühestens", "Spätestens", "Verweildauer"
    ];
    
    const rows = ordersToExport.map(o => {
      // Address parsing
      const addressStr = o.customer.address || "";
      const parts = addressStr.split(',');
      let streetPart = parts[0]?.trim() || "";
      let cityPart = parts[1]?.trim() || "";

      let plz = "";
      let stadt = "";
      const cityMatch = cityPart.match(/^(\d{5})\s+(.*)$/);
      if (cityMatch) {
        plz = cityMatch[1];
        stadt = cityMatch[2];
      } else {
        stadt = cityPart;
      }

      let strasse = streetPart;
      let hausnummer = "";
      const streetMatch = streetPart.match(/^(.*?)(\s*\d+[a-zA-Z\s\-]*)$/);
      if (streetMatch) {
        strasse = streetMatch[1].trim();
        hausnummer = streetMatch[2].trim();
      }

      // Telephone
      const telefon = o.customer.mobile || o.customer.phone || "";

      // Notice / Note
      let notiz = o.orderType || "";
      if (o.vosNumber) notiz += ` | VOS: ${o.vosNumber}`;
      if (o.estimatedDuration) notiz += ` | ${o.estimatedDuration} geplant`;
      
      // Kontakthistorie hinzufügen (Letzte Notiz)
      const hist = (o as any).history;
      if (hist && hist.length > 0) {
        notiz += ` | NOTIZ: ${hist[0].content}`;
      }

      // Time windows (default to service window 08:00 - 17:00 if not explicit)
      let fruehestens = "08:00";
      let spaetestens = "17:00";
      if (o.kundenTerminStart) {
        const d = new Date(o.kundenTerminStart);
        fruehestens = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
      
      const isBde = o.orderType && o.orderType.toLowerCase().includes('bde');
      const displayName = isBde ? `BdE: ${o.customer.customerName}` : o.customer.customerName;

      const row = [
        "", // Tour
        plz,
        stadt,
        strasse,
        hausnummer,
        o.vehicle, // Fahrer
        o.port || "", // Port
        displayName, // Ansprechpartner (wie gewünscht)
        o.customer.customerNumber || "",
        telefon, // Ansprechpartner Telefon
        notiz,
        displayName, // Name
        telefon, // Name Telefon
        o.id.substring(0, 8), // Referenz
        fruehestens,
        spaetestens,
        o.estimatedDuration ? o.estimatedDuration.replace(/\D/g,'') : "0" // Verweildauer
      ];

      // Escape quotes for CSV
      return row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`);
    });

    const csvContent = [header.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    
    // UTF-8 BOM (\uFEFF) to fix Umlaute in Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileName = vehicleName 
      ? `xRoute_Export_${vehicleName.replace(' ', '_')}.csv`
      : `xRoute_Export_Alle_Autos.csv`;
      
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Lade Aufträge...</div>;
  }

  // Pool filtern und sortieren (Termine zuerst, dann chronologisch nach Erstellung)
  const unassignedOrders = orders
    .filter(o => !o.vehicle)
    .sort((a, b) => {
      // Wenn beide einen Termin haben, nach Datum sortieren
      if (a.kundenTerminStart && b.kundenTerminStart) {
        return new Date(a.kundenTerminStart).getTime() - new Date(b.kundenTerminStart).getTime();
      }
      // Wenn nur a einen Termin hat, a nach oben
      if (a.kundenTerminStart) return -1;
      // Wenn nur b einen Termin hat, b nach oben
      if (b.kundenTerminStart) return 1;
      // Sonst egal (bleibt createdAt)
      return 0;
    });

  const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Auftrag endgültig löschen?</h3>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Dieser Auftrag (inklusive der gesamten Dokumentation und Historie) wird unwiderruflich aus der Datenbank gelöscht. Dies kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          Disposition & Fahrzeugplanung
        </h1>
        
        <button 
          onClick={() => handleExportCsv()}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Map className="w-5 h-5" />
          Tages-Export (Alle Autos)
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
        
        {/* Pool: Unzugewiesen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Offener Pool
              <span className="bg-gray-200 text-gray-700 text-sm py-1 px-3 rounded-full">
                {unassignedOrders.length}
              </span>
            </h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
            {unassignedOrders.map(order => (
              <div key={order.id} className="border border-gray-200 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow group relative">
                
                {/* Header: Typ & Delete Button */}
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                    {order.orderType || "Unbekannter Typ"}
                  </span>
                  <button 
                    onClick={() => setOrderToDelete(order.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Auftrag löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Kunde & Adresse */}
                <div className="font-medium text-sm text-blue-900 mb-0.5">{order.customer.customerName}</div>
                <div className="text-xs text-gray-600 mb-2 truncate">{order.customer.address}</div>
                
                {/* Termin Badge (falls vorhanden) */}
                {order.kundenTerminStart && (
                  <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 mb-3 w-max">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">
                      Fixtermin: {new Date(order.kundenTerminStart).toLocaleDateString('de-DE')} - {new Date(order.kundenTerminStart).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {!order.kundenTerminStart && (
                  <div className="mb-3"></div> // Spacer wenn kein Termin
                )}
                
                <select 
                  className="w-full text-sm border-gray-300 rounded bg-gray-50 p-1.5 focus:ring-blue-500 outline-none"
                  value={order.vehicle || ""}
                  onChange={(e) => handleAssign(order.id, e.target.value)}
                >
                  <option value="" disabled>Auto zuweisen...</option>
                  {vehicles.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            ))}
            {unassignedOrders.length === 0 && (
              <div className="text-center text-sm text-gray-400 mt-10">Keine unzugewiesenen Aufträge.</div>
            )}
          </div>
        </div>

        {/* Fahrzeuge */}
        {vehicles.map(vehicle => {
          const vehicleOrders = orders.filter(o => o.vehicle === vehicle);
          return (
            <div key={vehicle} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b border-gray-100 bg-blue-50/50 rounded-t-xl flex justify-between items-center">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-blue-900">
                  <CarFront className="w-5 h-5" />
                  {vehicle}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm py-1 px-3 rounded-full font-medium">
                  {vehicleOrders.length}
                </span>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                {vehicleOrders.map(order => (
                  <div key={order.id} className="border border-blue-100 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow group relative">
                    
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                        {order.orderType || "Unbekannter Typ"}
                      </span>
                      <button 
                        onClick={() => setOrderToDelete(order.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Auftrag löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="font-medium text-sm text-blue-900 mb-0.5">{order.customer.customerName}</div>
                    <div className="text-xs text-gray-600 mb-2 truncate">{order.customer.address}</div>
                    
                    {order.kundenTerminStart && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100 mb-3 w-max">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">
                          Fixtermin: {new Date(order.kundenTerminStart).toLocaleDateString('de-DE')} - {new Date(order.kundenTerminStart).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {!order.kundenTerminStart && (
                      <div className="mb-3"></div>
                    )}

                    <select 
                      className="w-full text-sm border-blue-300 rounded bg-blue-50/50 p-1.5 focus:ring-blue-500 outline-none text-blue-800 font-medium"
                      value={order.vehicle || ""}
                      onChange={(e) => handleAssign(order.id, e.target.value === "none" ? null : e.target.value)}
                    >
                      <option value="" disabled>Auto zuweisen...</option>
                      <option value="none">-- Zurück in Pool --</option>
                      {vehicles.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {vehicleOrders.length === 0 && (
                  <div className="text-center text-sm text-gray-400 mt-10">Keine Aufträge geplant.</div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button 
                  onClick={() => handleExportCsv(vehicle)}
                  disabled={vehicleOrders.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Map className="w-4 h-4" />
                  xRoute Export (CSV)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
