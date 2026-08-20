"use client";

import { useEffect, useState } from "react";
import { getTerminabsprachen, updateTerminabsprache, logCall, saveTerminNote } from "./actions";
import { Phone, CalendarCheck, Clock, CarFront, ChevronDown, FileText } from "lucide-react";
import { Vehicle } from "@/types";
import { toast } from "sonner";

type TerminOrder = Awaited<ReturnType<typeof getTerminabsprachen>>[0];

export default function TerminabsprachenPage() {
  const [orders, setOrders] = useState<TerminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // States for the active order being edited
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("60 Minuten");
  const [vehicle, setVehicle] = useState("none");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const durations = ["30 Minuten", "60 Minuten", "90 Minuten", "120 Minuten", "240 Minuten", "Individuell"];
  const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getTerminabsprachen();
    setOrders(data);
    setLoading(false);
  };

  const openEditor = (orderId: string) => {
    setActiveOrder(orderId);
    setDate("");
    setNote("");
    setVehicle("none");
    setDuration("60 Minuten");
  };

  const handleCall = async (orderId: string, phone: string | null) => {
    if (!phone) {
      toast.error("Keine Telefonnummer vorhanden");
      return;
    }
    window.location.href = `tel:${phone}`;
    await logCall(orderId);
    toast.success("Anruf dokumentiert");
  };

  const handleSaveAppointment = async (orderId: string) => {
    if (!date) {
      toast.error("Bitte ein Datum auswählen für einen Fixtermin!");
      return;
    }
    setIsSaving(true);
    await updateTerminabsprache(orderId, duration, vehicle, new Date(date), note);
    setIsSaving(false);
    toast.success("Termin gespeichert und in Disposition verschoben");
    setActiveOrder(null);
    fetchData();
  };

  const handleSaveNoteOnly = async (orderId: string) => {
    if (!note.trim()) {
      toast.error("Bitte eine Notiz eingeben.");
      return;
    }
    setIsSaving(true);
    await saveTerminNote(orderId, note);
    setIsSaving(false);
    toast.success("Notiz gespeichert. Auftrag bleibt in Terminabsprachen.");
    setActiveOrder(null);
    fetchData();
  };

  if (loading) return <div className="p-8 text-gray-500">Lade Terminabsprachen...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-amber-600">
          <CalendarCheck className="w-8 h-8" />
          Terminabsprachen (VOS)
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center border rounded-xl text-gray-500">
          Keine offenen Terminabsprachen.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {orders.map(order => {
            const isEditing = activeOrder === order.id;
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-gray-100 bg-amber-50 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{order.customer.customerName}</h2>
                    <p className="text-sm text-gray-600 mt-1">VOS-Auftrag: <span className="font-medium text-slate-900">{order.vosNumber}</span></p>
                    <p className="text-sm text-gray-600">Kd-Nr: {order.customer.customerNumber} | {order.broadbandTechnology}</p>
                    <p className="text-xs font-semibold text-amber-700 mt-1 uppercase tracking-wider">{order.communicationStatus}</p>
                  </div>
                  <button 
                    onClick={() => handleCall(order.id, order.customer.mobile || order.customer.phone)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Anrufen
                  </button>
                </div>
                
                <div className="p-5 flex-1">
                  <p className="text-sm text-gray-800 mb-4 font-medium">{order.customer.address}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Kontakt: {order.customer.mobile || order.customer.phone || 'Keine Nummer hinterlegt'}
                  </p>

                  {!isEditing ? (
                    <button 
                      onClick={() => openEditor(order.id)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Termin & Notizen eintragen
                    </button>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-2">
                      
                      {/* Note Field */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3"/> Gesprächsnotizen / Klärung</label>
                        <textarea 
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="z.B. Eigentümer muss noch gefragt werden, Kaminschacht klären..."
                          className="border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white text-sm min-h-[80px]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Fix-Datum & Uhrzeit (Optional wenn noch in Klärung)</label>
                        <input 
                          type="datetime-local" 
                          step="1800"
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> Dauer</label>
                          <select 
                            value={duration} 
                            onChange={e => setDuration(e.target.value)}
                            className="border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                          >
                            {durations.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><CarFront className="w-3 h-3"/> Fahrzeug</label>
                          <select 
                            value={vehicle} 
                            onChange={e => setVehicle(e.target.value)}
                            className="border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                          >
                            <option value="none">Noch offen (Pool)</option>
                            {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => handleSaveAppointment(order.id)}
                          disabled={isSaving}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          📅 Termin fixieren & ins CRM
                        </button>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSaveNoteOnly(order.id)}
                            disabled={isSaving}
                            className="flex-1 bg-amber-100 text-amber-800 hover:bg-amber-200 py-2 rounded-lg font-medium transition-colors text-sm border border-amber-200 disabled:opacity-50"
                          >
                            Nur Notiz speichern (Klärung)
                          </button>
                          <button 
                            onClick={() => setActiveOrder(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
