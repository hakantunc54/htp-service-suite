"use client";
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { useEffect, useState } from "react";
import { getOrderDetails, getSmsTemplates, addHistoryEntry, updateOrderStatus } from "./actions";
import { Phone, MessageSquare, ArrowLeft, Clock, Send, CheckCircle2, AlertTriangle, CheckSquare } from "lucide-react";
import Link from "next/link";
import { OrderStatus, CommunicationStatus } from "@/types";
import { use } from "react";
import { toast } from "sonner";

type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
type SmsTemplate = Awaited<ReturnType<typeof getSmsTemplates>>[0];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15+ requirement)
  const resolvedParams = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [note, setNote] = useState("");
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const fetchData = async () => {
    setLoading(true);
    const [orderData, templatesData] = await Promise.all([
      getOrderDetails(resolvedParams.id),
      getSmsTemplates()
    ]);
    setOrder(orderData);
    setTemplates(templatesData);
    setLoading(false);
  };

  const handleSmsAction = async (templateName: string) => {
    if (!order) return;
    const template = templates.find(t => t.name === templateName);
    if (!template) return;

    // Replace variables
    let content = template.content.replace("{name}", order.customer.customerName);
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(content);
      toast.success("SMS kopiert! Google Messages öffnet sich...", { duration: 4000 });
      
      // Open Google Messages
      window.open("https://messages.google.com/web/", "_blank");
      
      // Log History
      await addHistoryEntry(order.id, "SMS", `SMS '${templateName}' generiert und kopiert.`);
      
      // Update Communication Status
      await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
      fetchData(); // Reload history
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Fehler beim Kopieren in die Zwischenablage.");
    }
  };

  const handleCall = async () => {
    if (!order?.customer.phone && !order?.customer.mobile) {
      toast.error("Keine Telefonnummer hinterlegt.");
      return;
    }
    const phone = order.customer.mobile || order.customer.phone;
    window.location.href = `tel:${phone}`;
    
    await addHistoryEntry(order.id, "CALL", "Kunde angerufen.");
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
            {order.port && (
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono">Port: {order.port}</span>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anschlussadresse</h3>
            <p className="text-slate-800">{order.customer.address}</p>
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
              onClick={() => handleSmsAction("Erstkontakt")}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">SMS senden</span>
              <span className="text-xs opacity-70 mt-1">Google Messages</span>
            </button>
          </div>

          
          <h3 className="text-sm font-bold text-gray-800 mb-3">Status Updates (Quick Actions)</h3>
          <div className="flex flex-col gap-2 mb-8">
            <button onClick={() => handleQuickAction(OrderStatus.KUNDE_ERREICHT, CommunicationStatus.ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
              📢 Kunde erreicht
            </button>
            <button onClick={() => handleQuickAction(OrderStatus.KUNDE_NICHT_ERREICHT, CommunicationStatus.NICHT_ERREICHT)} className="text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border">
              📢 Kunde nicht erreicht
            </button>
            
            <button 
              onClick={handleCloneOrder} 
              disabled={isCloning}
              className="text-left px-4 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg border border-orange-200 mt-4 font-bold flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Copy className="w-4 h-4" /> BDE Abbrechen & Folgeauftrag (Klon) erstellen
            </button>
          </div>


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

    </div>
  );
}
