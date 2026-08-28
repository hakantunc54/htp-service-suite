"use client";

import { useEffect, useState, Suspense } from "react";
import { getOrders, getServiceItems, saveBilling } from "./actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Search, ChevronRight, Calculator, FileCheck2, Filter, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type OrderData = Awaited<ReturnType<typeof getOrders>>[0];
type ServiceItem = Awaited<ReturnType<typeof getServiceItems>>[0];

function OrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams?.get("q") || "");
  const [dateFilter, setDateFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("Datum");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };
  
  const renderSortIndicator = (col: string) => {
    if (sortColumn !== col) return null;
    return <span className="ml-1 text-blue-600">{sortDirection === "asc" ? "\u2191" : "\u2193"}</span>;
  };

  useEffect(() => {
    if (searchParams?.get("q")) setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  // Billing Modal State
  const [billingOrder, setBillingOrder] = useState<OrderData | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [apartmentLocation, setApartmentLocation] = useState("");
  const [technicianRemark, setTechnicianRemark] = useState("");
  const [bdeStatus, setBdeStatus] = useState("BDE erledigt - neuer BT erforderlich");
  const [vehicle, setVehicle] = useState("");
  const [materialDetails, setMaterialDetails] = useState("Zeitaufwand: 1 Techniker 2,00 Std.\nMaterialaufwand: \n- 10m ISTY (15,00 EUR)\n- 5m Verlegematerial (7,50 EUR)\n- 1 x TAE Dose AP (15 EUR)");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ordersData, itemsData] = await Promise.all([
      getOrders(),
      getServiceItems()
    ]);
    setOrders(ordersData);
    setServiceItems(itemsData);
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    // 1. Search term
    const term = search.toLowerCase();
    const matchesSearch = 
      o.customer.customerName.toLowerCase().includes(term) ||
      o.customer.address.toLowerCase().includes(term) ||
      (o.orderType?.toLowerCase() || "").includes(term) ||
      (o.customer.customerNumber?.toLowerCase() || "").includes(term) ||
      (o.customer.phone?.toLowerCase() || "").includes(term) ||
      (o.customer.mobile?.toLowerCase() || "").includes(term);
    
    // 2. Date Filter
    let matchesDate = true;
    if (dateFilter) {
      if (!o.kundenTerminStart) {
        matchesDate = false;
      } else {
        const orderDateStr = new Date(o.kundenTerminStart).toISOString().split('T')[0];
        matchesDate = orderDateStr === dateFilter;
      }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    let valA: any = "";
    let valB: any = "";
    
    if (sortColumn === "Kunde") {
      valA = a.customer.customerName;
      valB = b.customer.customerName;
    } else if (sortColumn === "Adresse") {
      valA = a.customer.address;
      valB = b.customer.address;
    } else if (sortColumn === "Auftragstyp") {
      valA = a.orderType || "";
      valB = b.orderType || "";
    } else if (sortColumn === "Status") {
      valA = a.status || "";
      valB = b.status || "";
    } else if (sortColumn === "Abrechnung") {
      valA = a.status === "Abgerechnet" ? "1" : "0";
      valB = b.status === "Abgerechnet" ? "1" : "0";
    } else if (sortColumn === "Datum") {
      valA = a.kundenTerminStart ? new Date(a.kundenTerminStart).getTime() : 0;
      valB = b.kundenTerminStart ? new Date(b.kundenTerminStart).getTime() : 0;
    }
    
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

      const openBilling = (order: OrderData) => {
    setBillingOrder(order);
    
    const newQuantities: Record<string, number> = {};
    const newVariables: Record<string, number> = {};
    
    if (order.services && order.services.length > 0) {
      order.services.forEach(s => {
        const si = serviceItems.find(item => item.id === s.serviceItemId);
        if (si && (si.name.toLowerCase().includes("optional") || si.name.toLowerCase().includes("material"))) {
          newVariables[s.serviceItemId] = Number(s.priceApplied || 0);
        } else {
          newQuantities[s.serviceItemId] = Number(s.quantity);
        }
      });
    }
    
    setQuantities(newQuantities);
    setVariableValues(newVariables);
    
    setApartmentLocation(order.apartmentLocation || "");
    setTechnicianRemark(order.technicianRemark || "");
    setVehicle(order.vehicle || "");
    setBdeStatus(order.bdeStatus || "BDE erledigt - neuer BT erforderlich");
    setMaterialDetails(order.materialDetails || "Zeitaufwand: 1 Techniker 2,00 Std.\nMaterialaufwand: \n- 10m ISTY (15,00 EUR)\n- 5m Verlegematerial (7,50 EUR)\n- 1 x TAE Dose AP (15 EUR)");
  };

  const isBDE = billingOrder ? ((billingOrder.orderType || "").toLowerCase().includes("bde") || (billingOrder.orderType || "").toLowerCase().includes("endleitung") || billingOrder.vosNumber) : false;
  
    const getRelevantServiceItems = () => {
    if (!billingOrder) return [];
    
                  
    const category = isBDE ? "BDE" : "FTTB";
    
    // Exact sorting order for FTTB as requested by the user
    const fttbOrder = [
      "FTTB",
      "Abbruch",
      "MAW (5Min)",
      "PCI",
      "vLauiAPLe",
      "Warten 5Min",
      "Warten 10Min",
      "fZugang DPU/APL",
      "KvHdF",
      "Dispo",
      "DPU Aufbau",
        "Optional / Material (FTTB)"
    ];

    // For BDE, just some logical order
    const bdeOrder = [
      "Arbeitszeit (Std.)",
      "Material (BDE)",
      "Optional (BDE)"
    ];

    const sortOrder = isBDE ? bdeOrder : fttbOrder;

    return serviceItems
      .filter(item => item.category === category)
      .filter(item => !item.name.toLowerCase().includes('anfahrt'))
      .sort((a, b) => {
        const indexA = sortOrder.indexOf(a.name);
        const indexB = sortOrder.indexOf(b.name);
        // If not found in array, put at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  };

  const relevantItems = getRelevantServiceItems();

  const isItemDisabled = (itemName: string) => {
    const fttbId = relevantItems.find(i => i.name === "FTTB")?.id;
    const abbruchId = relevantItems.find(i => i.name === "Abbruch")?.id;
    const hasFTTB = fttbId ? (quantities[fttbId] || 0) > 0 : false;
    const hasAbbruch = abbruchId ? (quantities[abbruchId] || 0) > 0 : false;
    
    if (hasFTTB && ["Abbruch", "KvHdF", "fZugang DPU/APL"].includes(itemName)) return true;
    if (hasAbbruch && ["FTTB", "PCI", "vLauiAPLe"].includes(itemName)) return true;
    return false;
  };

  const calculateTotal = () => {
    let total = 0;
    relevantItems.forEach(item => {
      if (isItemDisabled(item.name)) return; // Ignoriere gesperrte Felder
      
      const q = quantities[item.id] || 0;
      if (item.name.toLowerCase().includes("optional") || item.name.toLowerCase().includes("material")) {
          total += (variableValues[item.id] || 0);
        } else {
        total += (item.defaultPrice || 0) * q;
      }
    });
    return total;
  };

  const handleSaveBilling = async () => {
    if (!billingOrder) return;
    
    const itemsToSave = [];
    for (const item of relevantItems) {
      if (isItemDisabled(item.name)) continue; // Ignoriere gesperrte Felder
      
      const q = quantities[item.id] || 0;
      const isVariable = item.name.toLowerCase().includes("optional") || item.name.toLowerCase().includes("material");
      
      if (isVariable && (variableValues[item.id] || 0) > 0) {
          itemsToSave.push({ serviceItemId: item.id, quantity: 1, amount: variableValues[item.id] });
        } else if (q > 0) {
        itemsToSave.push({ serviceItemId: item.id, quantity: q, amount: (item.defaultPrice || 0) * q });
      }
    }

    const totalAmount = calculateTotal();
    
    try {
      await saveBilling(billingOrder.id, itemsToSave, totalAmount, apartmentLocation, technicianRemark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined, vehicle);
      toast.success("Auftrag erfolgreich abgerechnet!");
      setBillingOrder(null);
      fetchData();
    } catch (e) {
      toast.error("Fehler beim Speichern der Abrechnung.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col relative">
      
      {/* Billing Modal */}
      {billingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in-95 my-8">
            <div className="p-6 border-b border-gray-100 bg-blue-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Abrechnung erstellen
                </h3>
                <p className="text-sm text-blue-800 mt-1">{billingOrder.customer.customerName} - {billingOrder.customer.address}</p>
              </div>
              <button onClick={() => setBillingOrder(null)} className="p-2 hover:bg-blue-100 rounded-full text-blue-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50">
              <div className="grid grid-cols-[1fr_auto_100px_100px] gap-4 mb-3 font-semibold text-xs text-slate-500 uppercase tracking-wider px-2">
                <div>Leistung</div>
                <div>Einzelpreis</div>
                <div className="text-center">Anzahl</div>
                <div className="text-right">Gesamt</div>
              </div>
              
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {relevantItems.map(item => {
                  const isVariable = item.name.toLowerCase().includes("optional") || item.name.toLowerCase().includes("material");
                  const isToggle = ["FTTB", "Abbruch", "PCI", "vLauiAPLe", "fZugang DPU/APL", "KvHdF"].includes(item.name);
                  
                  const disabled = isItemDisabled(item.name);
                  const q = disabled ? 0 : (quantities[item.id] || 0);
                  const rowTotal = isVariable ? (variableValues[item.id] || 0) : (item.defaultPrice || 0) * q;
                  
                  return (
                    <div key={item.id} className={`grid grid-cols-[1fr_auto_100px_100px] gap-4 items-center bg-white p-3 rounded-lg border ${disabled ? 'border-gray-100 opacity-50 grayscale' : 'border-gray-200 shadow-sm hover:border-blue-300'} transition-all`}>
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-slate-500 text-sm whitespace-nowrap">
                        {isVariable ? 'variabel' : `${item.defaultPrice?.toFixed(2)} €`}
                      </div>
                      <div>
                        {isVariable ? (
                          <div className="text-xs text-center text-gray-400">Betrag (€)</div>
                        ) : isToggle ? (
                          <button 
                            disabled={disabled}
                            onClick={() => {
                              const newVal = q > 0 ? 0 : 1;
                              setQuantities({...quantities, [item.id]: newVal});
                            }}
                            className={`w-full py-1.5 rounded text-sm font-medium transition-colors ${q > 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${disabled && 'cursor-not-allowed'}`}
                          >
                            {q > 0 ? 'Ja (1)' : 'Nein (0)'}
                          </button>
                        ) : (
                          <input 
                            type="number" 
                            min="0"
                            step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}
                            disabled={disabled}
                            className={`w-full text-center border-gray-300 rounded py-1 px-2 focus:ring-blue-500 outline-none text-sm ${disabled ? 'bg-gray-100' : 'bg-gray-50'}`}
                            value={q || ""}
                            placeholder="0"
                            onChange={e => setQuantities({...quantities, [item.id]: parseFloat(e.target.value.replace(",", ".")) || 0})}
                          />
                        )}
                      </div>
                      <div className="text-right font-semibold text-slate-700">
                        {isVariable ? (
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            disabled={disabled}
                            className="w-full text-right border-gray-300 rounded bg-blue-50 py-1 px-2 focus:ring-blue-500 outline-none text-sm font-medium"
                            value={variableValues[item.id] || ""}
                            placeholder="0,00"
                            onChange={e => setVariableValues({...variableValues, [item.id]: parseFloat(e.target.value) || 0})}
                          />
                        ) : (
                          `${rowTotal.toFixed(2)} €`
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WE-Lage</label>
                  <input 
                    type="text" 
                    value={apartmentLocation}
                    onChange={e => setApartmentLocation(e.target.value)}
                    placeholder="z.B. 2. OG links"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                {isBDE && (
                  <>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">BDE Status (für Excel)</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm bg-white"
                        value={bdeStatus}
                        onChange={(e) => setBdeStatus(e.target.value)}
                      >
                        <option value="BDE erledigt - neuer BT erforderlich">BDE erledigt - neuer BT erforderlich</option>
                        <option value="BDE erledigt - TAL in Betrieb">BDE erledigt - TAL in Betrieb</option>
                        <option value="Abbruch">Abbruch</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stunden / Material (für Excel)</label>
                      <textarea 
                        value={materialDetails}
                        onChange={e => setMaterialDetails(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm font-mono resize-none"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bemerkung / Mehraufwand</label>
                  <textarea 
                    value={technicianRemark}
                    onChange={e => setTechnicianRemark(e.target.value)}
                    placeholder="z.B. Kabelkanal 5m gezogen"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium text-slate-600">Gesamtsumme:</span>
                <span className="text-3xl font-black text-blue-600">{calculateTotal().toFixed(2)} €</span>
              </div>
              <button 
                onClick={handleSaveBilling}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <FileCheck2 className="w-5 h-5" />
                Jetzt abrechnen & Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Kunden & Aufträge
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0 h-full mb-8">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Suchen (Name, Adresse, Typ)..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Datum:</span>
            <input 
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter("")}
                className="text-xs text-red-500 hover:underline whitespace-nowrap"
              >
                Filter löschen
              </button>
            )}
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Lade Daten...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th onClick={() => handleSort("Kunde")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Kunde {renderSortIndicator("Kunde")}
                  </th>
                  <th onClick={() => handleSort("Adresse")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Adresse {renderSortIndicator("Adresse")}
                  </th>
                  <th onClick={() => handleSort("Auftragstyp")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Auftragstyp {renderSortIndicator("Auftragstyp")}
                  </th>
                  <th onClick={() => handleSort("Datum")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Datum {renderSortIndicator("Datum")}
                  </th>
                  <th onClick={() => handleSort("Status")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Status {renderSortIndicator("Status")}
                  </th>
                  <th onClick={() => handleSort("Abrechnung")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Abrechnung {renderSortIndicator("Abrechnung")}
                  </th>
                  <th className="px-6 py-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{order.customer.customerName}</div>
                      <div className="text-xs text-gray-500">Kd-Nr: {order.customer.customerNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.customer.address}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {order.orderType || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.kundenTerminStart ? new Date(order.kundenTerminStart).toLocaleDateString('de-DE') : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Erfolgreich abgeschlossen" ? "bg-green-100 text-green-800" :
                        order.status === "Storniert" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.isBilled ? (
                        <button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>
                      ) : (
                        <button
                          onClick={() => openBilling(order)}
                          className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold py-1.5 px-3 rounded-lg border border-amber-200 transition-colors shadow-sm"
                        >
                          Abrechnen
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
                      >
                        Akte <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Keine Aufträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Lade Auftr�ge...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
