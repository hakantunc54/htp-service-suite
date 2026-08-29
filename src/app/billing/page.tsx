"use client";
import { generatePdf } from '@/lib/pdfGenerator';

import { useEffect, useState } from "react";
import { getBillingData } from "./actions";
import { Calculator, Download, Calendar, Trash2, X } from "lucide-react";
import { deleteOrder } from "../orders/actions";
import { toast } from "sonner";

type BillingOrder = Awaited<ReturnType<typeof getBillingData>>[0];

export default function BillingPage() {
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(true);

  // Date filters for Export
  const now = new Date();
  
  // Format local date manually to avoid UTC shifting
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayLocal = `${yyyy}-${mm}-${dd}`;
  const firstDayLocal = `${yyyy}-${mm}-01`;

  const [startDate, setStartDate] = useState(firstDayLocal);
  const [endDate, setEndDate] = useState(todayLocal);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getBillingData();
    setOrders(data);
    setLoading(false);
  };


  const handlePdfExport = async (type: 'FTTB' | 'BDE') => {
    if (!startDate || !endDate) {
      toast.error("Bitte Start- und Enddatum w\u00e4hlen");
      return;
    }
    
    setIsExporting(true);
    toast.info("Generiere PDF...");
    
    try {
      const response = await fetch(`/api/export-billing?start=${startDate}&end=${endDate}&format=json`);
      const data = await response.json();
      
      const monthNames = ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
      const startD = new Date(startDate);
      const monthStr = monthNames[startD.getMonth()] + " " + startD.getFullYear();
      
      const title = `Leistungsnachweis ${type} - ${monthStr}`;
      const exportData = type === 'FTTB' ? data.groupedFttb : data.groupedBde;
      
      generatePdf(title, exportData, type, data.totals);
      toast.success("PDF erfolgreich generiert!");
    } catch (e) {
      console.error(e);
      toast.error("Fehler beim PDF Export");
    } finally {
      setIsExporting(false);
    }
  };

  
  const handleDeleteOrder = (orderId: string, customerName: string) => {
    setOrderToDelete({ id: orderId, name: customerName });
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setLoading(true);
    try {
      const result = await deleteOrder(orderToDelete.id);
      if (result.success) {
        toast.success("Auftrag erfolgreich gel�scht.");
        await fetchData();
      } else {
        toast.error(result.error || "Fehler beim L�schen.");
      }
    } catch (e) {
      toast.error("Fehler beim L�schen.");
    } finally {
      setLoading(false);
      setOrderToDelete(null);
    }
  };

  const handleExport = async () => {

    if (!startDate || !endDate) {
      toast.error("Bitte Start- und Enddatum wählen");
      return;
    }
    
    setIsExporting(true);
    toast.info("Generiere Excel-Export...");
    
    try {
      const url = `/api/export-billing?start=${startDate}&end=${endDate}`;
      window.location.href = url;
      toast.success("Download gestartet!");
    } catch (e) {
      toast.error("Fehler beim Export");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Lade Abrechnungsdaten...</div>;
  }

  // Nur abgerechnete Aufträge anzeigen
  const billedOrders = orders.filter(o => o.isBilled);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-600" />
          Abrechnung & Export
        </h1>
        
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="text-sm border-none outline-none focus:ring-0 text-gray-700 font-medium bg-transparent"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="text-sm border-none outline-none focus:ring-0 text-gray-700 font-medium bg-transparent"
            />
          </div>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Excel Exportieren
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Abgerechnete Aufträge</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Kunde</th>
              <th className="px-6 py-4">Typ</th>
              <th className="px-6 py-4">Datum</th>
              <th className="px-6 py-4">Summe</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {billedOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-slate-900">{order.customer.customerName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                    {order.orderType || 'Unbekannt'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {order.kundenTerminStart ? new Date(order.kundenTerminStart).toLocaleDateString('de-DE') : '-'}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {order.orderValue?.toFixed(2) || "0.00"} €
                </td>
              </tr>
            ))}
            {billedOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  Keine abgerechneten Aufträge gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    
      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Auftrag löschen
              </h3>
              <button onClick={() => setOrderToDelete(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Möchten Sie den abgerechneten Auftrag von <span className="font-semibold text-slate-800">{orderToDelete.name}</span> wirklich unwiderruflich löschen?
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={confirmDeleteOrder}
                  className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Unwiderruflich löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
