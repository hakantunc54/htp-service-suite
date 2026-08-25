"use client";
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { useEffect, useState } from "react";
import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus, cloneOrder, getAvailableServiceItems, updateOrderServices, updateOrderDetailsText } from "./actions";
import { Phone, MessageSquare, ArrowLeft, Clock, Send, CheckCircle2, AlertTriangle, CheckSquare, Settings2 } from "lucide-react";
import Link from "next/link";
import { OrderStatus, CommunicationStatus } from "@/types";
import { use } from "react";
import { toast } from "sonner";
import { EditServicesModal } from "@/components/EditServicesModal";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
type SmsTemplate = Awaited<ReturnType<typeof getSmsTemplates>>[0];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15+ requirement)
  const resolvedParams = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [manualSmsText, setManualSmsText] = useState("");
  const [showManualSmsModal, setShowManualSmsModal] = useState(false);
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setLoading(true);
    const [orderData, templatesData, itemsData] = await Promise.all([
      getOrderDetails(resolvedParams.id),
      getSmsTemplates(),
      getAvailableServiceItems()
    ]);
    setOrder(orderData);
    setTemplates(templatesData);
    setAvailableItems(itemsData);
    setLoading(false);
  };

  const handleSaveServices = async (newServices: any[], newRemark?: string, newBdeStatus?: string, newMaterialDetails?: string) => {
    if (!order) return;
    const res = await updateOrderServices(order.id, newServices, newRemark, newBdeStatus, newMaterialDetails);
    if (res.success) {
      toast.success("Leistungen & Bemerkung erfolgreich aktualisiert!");
      await fetchData();
    }
  };

  const [selectedTemplateName, setSelectedTemplateName] = useState("");

  const handleSmsAction = async (templateName: string) => {
    if (!order) return;
    const template = templates.find(t => t.name === templateName);
    if (!template) return;
    let content = template.content.replace("{name}", order.customer.customerName);
    
    setManualSmsText(content);
    setSelectedTemplateName(templateName);
    
    // Log history and status only when a template is explicitly chosen
    await addHistoryEntry(order.id, "SMS", `SMS '${templateName}' generiert.`);
    await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
    fetchData();
  };
  
  const openSmsModal = () => {
    setManualSmsText("");
    setSelectedTemplateName("");
    setShowManualSmsModal(true);
  };

  const handleCall = async () => {
    if (!order?.customer.phone && !order?.customer.mobile) {
      toast.error("Keine Telefonnummer hinterlegt.");
      return;
    }
    const phone = order.customer.mobile || order.customer.phone;
    window.location.href = `tel:${phone}`;
    
    await addHistoryEntry(order.id, "CALL", "?? Ausgehender Anruf (Ergebnis offen)");
    toast.success("Anruf dokumentiert");
    fetchData();
  };

  const handleAddNote = async () => {
    if (!note.trim() || !order) return;
    await addHistoryEntry(order.id, "NOTE", note);
    setNote("");
    toast.success("Notiz hinzugefügt");
    fetchData();
  };


  const handleCloneOrder = async () => {
    if (!order) return;
    const confirm = window.confirm("Möchtest du diesen Auftrag abschließen und einen Klon für HTP erstellen?");
    if (!confirm) return;
    
    setIsCloning(true);
    try {
      await updateOrderStatus(order.id, "Erfolgreich abgeschlossen", order.communicationStatus);
      const res = await cloneOrder(order.id);
      if (res.success) {
        toast.success("Folgeauftrag (Klon) erfolgreich erstellt!");
        router.push(`/orders/${res.newOrderId}`);
      }
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim Erstellen des Klon-Auftrags");
      setIsCloning(false);
    }
  };

  const handleQuickAction = async (status: string, commStatus?: string) => {

    if (!order) return;
    await updateOrderStatus(order.id, status, commStatus);
    toast.success(`Status auf '${status}' gesetzt`);
    fetchData();
  };

  if (loading) return <div className="p-8">Lade Akte...</div>;
  if (!order) return <div className="p-8">Auftrag nicht gefunden.</div>;

  return (
    <div className="flex h-full bg-slate-100">
      
      {/* Left Column: Customer Data & Actions */}
      <div className="w-1/3 min-w-[400px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <Link href="/orders" className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium mb-6">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Liste
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{order.customer.customerName}</h1>
          <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
            <span className="bg-gray-100 px-2 py-0.5 rounded">Kd-Nr: {order.customer.customerNumber}</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{order.orderType}</span>
            
<span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono group relative">
  Port: {order.port || "Fehlt"}
  <button 
    onClick={async () => {
      const newPort = window.prompt("Bitte Port eingeben:", order.port || "");
      if (newPort !== null) {
        await fetch(`/api/orders/${order.id}/port`, { method: 'POST', body: JSON.stringify({ port: newPort }) });
        window.location.reload();
      }
    }}
    className="ml-2 text-purple-400 hover:text-purple-900 underline text-xs"
  >
    Bearbeiten
  </button>
</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anschlussadresse</h3>
              <p className="text-slate-800">{order.customer.address}</p>
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-semibold">Telefon:</span> {order.customer.phone || 'Keine'}
              </div>
            </div>
            <button 
              onClick={async () => {
                const newAddress = window.prompt("Neue Adresse:", order.customer.address || "");
                if (newAddress !== null) {
                  const newPhone = window.prompt("Neue Telefonnummer:", order.customer.phone || "");
                  if (newPhone !== null) {
                    await fetch(`/api/customer/${order.customer.id}`, { 
                      method: 'POST', 
                      body: JSON.stringify({ address: newAddress, phone: newPhone, orderId: order.id }) 
                    });
                    window.location.reload();
                  }
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Bearbeiten
            </button>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-xl mb-6 flex justify-between items-start">
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">WE-Lage / Wohnung</h3>
                <p className="text-slate-800 text-sm">{order.apartmentLocation || <span className="text-gray-400 italic">Nicht angegeben</span>}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Bemerkung</h3>
                <p className="text-slate-800 text-sm whitespace-pre-wrap">{order.technicianRemark || <span className="text-gray-400 italic">Keine Bemerkung</span>}</p>
              </div>
            </div>
            
            <button 
              onClick={async () => {
                const newLage = window.prompt("Neue WE-Lage / Wohnung:", order.apartmentLocation || "");
                if (newLage !== null) {
                  const newRemark = window.prompt("Neue Bemerkung:", order.technicianRemark || "");
                  if (newRemark !== null) {
                    await updateOrderDetailsText(order.id, newLage, newRemark);
                    toast.success("Details gespeichert");
                  }
                }
              }}
              className="text-amber-700 hover:text-amber-900 text-sm font-medium flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded transition-colors"
            >
              <Settings2 className="w-3 h-3" /> Bearbeiten
            </button>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Erfasste Leistungen</h3>
              {true && (
                <button 
                  onClick={() => setIsServicesModalOpen(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                >
                  <Settings2 className="w-3 h-3" /> Bearbeiten
                </button>
              )}
            </div>
            
            {order.services.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Keine Leistungen hinterlegt</p>
            ) : (
              <ul className="space-y-2">
                {order.services.map(s => (
                  <li key={s.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-700"><span className="font-medium text-slate-500 mr-2">{s.quantity}x</span> {s.serviceItem.name}</span>
                    <span className="font-mono text-slate-600">{((s.priceApplied || 0) * s.quantity).toFixed(2).replace('.', ',')} €</span>
                  </li>
                ))}
                <li className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-gray-100 font-bold">
                  <span className="text-slate-800">Gesamt</span>
                  <span className="font-mono text-blue-600">{(order.orderValue || 0).toFixed(2).replace('.', ',')} €</span>
                </li>
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={handleCall}
              className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
            >
              <Phone className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">Anrufen</span>
              <span className="text-xs opacity-70 mt-1">{order.customer.mobile || order.customer.phone || 'Keine Nr.'}</span>
            </button>

            <button 
              onClick={openSmsModal}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">SMS senden</span>
              <span className="text-xs opacity-70 mt-1">Google Messages</span>
            </button>
          </div>

          {order.status !== "Erfolgreich abgeschlossen" && order.status !== "Storniert" && order.status !== "Abgerechnet" && (
            <>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Status Updates (Quick Actions)</h3>
              <div className="flex flex-col gap-2 mb-8">
                <button onClick={() => handleQuickAction(OrderStatus.KUNDE_ERREICHT, CommunicationStatus.ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
                  📞 Kunde erreicht
                </button>
                <button onClick={() => handleQuickAction(OrderStatus.KUNDE_NICHT_ERREICHT, CommunicationStatus.NICHT_ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
                  📞 Kunde nicht erreicht
                </button>
                
              </div>
            </>
          )}

          {/* Der Klon-Button für BDEs ist immer sichtbar, auch wenn abgerechnet wurde */}
          {(order.orderType || "").toLowerCase().includes("bde") && (
            <div className="mt-6 mb-8">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Auftrag abgebrochen?</h3>
              <button 
                onClick={handleCloneOrder} 
                disabled={isCloning}
                className="w-full text-left px-4 py-3 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-xl border border-red-200 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Copy className="w-5 h-5" /> Abbruch & Neu klonen (für 2. Anfahrt)
              </button>
              <p className="text-xs text-gray-500 mt-2 ml-1">
                Erstellt eine exakte Kopie dieses Auftrags in der Disposition (ohne die bisher abgerechneten Leistungen), um einen neuen Termin zu vereinbaren.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Right Column: History / Messenger */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-slate-800">Auftrags-Historie</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Status:</span>
            <span className="bg-gray-200 text-gray-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{order.status}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Initial System Entry */}
          <div className="self-start max-w-[80%]">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                SYSTEM <span className="text-gray-400 font-normal ml-2">{new Date(order.createdAt).toLocaleString('de-DE')}</span>
              </div>
              <p className="text-sm text-slate-800">Auftrag via Smart Import angelegt. Servicefenster: {order.serviceWindow}</p>
            </div>
          </div>

          {/* History Entries */}
          {order.history.map((entry) => {
            const isSystem = entry.type === "STATUS_CHANGE" || entry.type === "SYSTEM";
            return (
              <div key={entry.id} className={`max-w-[80%] ${isSystem ? 'self-center text-center w-full' : 'self-end'}`}>
                {isSystem ? (
                  <div className="inline-block bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium my-2">
                    {new Date(entry.createdAt).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} - {entry.content}
                  </div>
                ) : (
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm">
                    <div className="text-xs text-blue-200 mb-1 flex items-center gap-1">
                      ICH <span className="ml-2 opacity-70">{new Date(entry.createdAt).toLocaleString('de-DE')}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              placeholder="Eigene Notiz hinzufügen..." 
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full px-5 py-3 text-sm transition-all outline-none"
            />
            <button 
              onClick={handleAddNote}
              disabled={!note.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
            </button>
          </div>
        </div>
      </div>

      {showManualSmsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                SMS Senden
              </h2>
              <button onClick={() => setShowManualSmsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                Schließen
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">1. Rufnummer (Google Messages)</label>
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <input 
                    type="text" 
                    readOnly 
                    className="bg-transparent font-mono text-gray-800 flex-1 outline-none" 
                    value={order?.customer.mobile || order?.customer.phone || 'Keine Nummer hinterlegt'} 
                    onFocus={e => e.target.select()}
                  />
                  <span className="text-xs text-gray-400">Strg+C</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">2. Vorlage auswählen</label>
                <div className="flex flex-col gap-2">
                  {[...templates].sort((a,b) => {
                    const orderList = ["Erstkontakt", "Erinnerung", "Letzte Erinnerung"];
                    const indexA = orderList.indexOf(a.name);
                    const indexB = orderList.indexOf(b.name);
                    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
                  }).map(t => (
                    <button 
                      key={t.id}
                      onClick={() => handleSmsAction(t.name)}
                      className={`text-left px-4 py-2.5 rounded-lg border transition-all ${selectedTemplateName === t.name ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {manualSmsText && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">3. SMS Text kopieren</label>
                  <textarea 
                    className="w-full h-32 p-3 border border-blue-200 bg-blue-50/30 rounded-xl outline-none font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                    value={manualSmsText}
                    readOnly
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                  <p className="text-xs text-gray-500 mt-2">Text anklicken und Strg+C drücken.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setShowManualSmsModal(false)}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
              >
                Abbrechen
              </button>
              <a 
                href="https://messages.google.com/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Google Messages öffnen
              </a>
            </div>
          </div>
        </div>
      )}

      <EditServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        orderId={order.id}
        orderType={order.orderType || ""}
        availableItems={availableItems}
        currentServices={order.services}
        onSave={handleSaveServices}
        currentRemark={order.technicianRemark || ""}
        currentBdeStatus={order.bdeStatus || ""}
        currentMaterialDetails={order.materialDetails || ""}
      />
    </div>
  );
}
