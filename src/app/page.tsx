import RevenueChart from '@/components/RevenueChart';
﻿import { PrismaClient } from "@prisma/client";
import { FileText, CalendarCheck, PhoneCall, Euro, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function Home() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const ordersToday = await prisma.order.count({
    where: { createdAt: { gte: startOfToday, lte: endOfToday } }
  });

  const callbacksToday = await prisma.order.count({
    where: {
      status: { in: ["Kunde nicht erreicht", "Kunde hat zurückgerufen", "Neu"] },
      communicationStatus: { notIn: ["Termin bestätigt"] }
    }
  });

  const appointmentsToday = await prisma.order.count({
    where: { kundenTerminStart: { gte: startOfToday, lte: endOfToday } }
  });

  const financialData = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: false, status: "Erfolgreich abgeschlossen" }
  });
  
  const billedData = await prisma.order.aggregate({
    _sum: { orderValue: true },
    where: { isBilled: true }
  });

  const openValue = financialData._sum.orderValue || 0;
  const closedValue = billedData._sum.orderValue || 0;

  
  // All completed orders for the chart
  const allBilledOrders = await prisma.order.findMany({
    where: { status: "Erfolgreich abgeschlossen" },
    select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true }
  });

  const monthNames = ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  
  const chartDataMap: Record<string, any> = {};
  
  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!chartDataMap[key]) {
      chartDataMap[key] = { year, month, monthName: monthNames[month], FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const type = (o.orderType || "").toLowerCase().includes("bde") ? "BDE" : "FTTB";
    chartDataMap[key][type] += val;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Aufträge erfasst (heute)</h3>
            <p className="text-3xl font-bold mt-1">{ordersToday}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Vereinbarte Termine (heute)</h3>
            <p className="text-3xl font-bold mt-1 text-green-600">{appointmentsToday}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Offene Rückrufe</h3>
            <p className="text-3xl font-bold mt-1 text-amber-600">{callbacksToday}</p>
          </div>
        </div>

      </div>

      <h2 className="text-xl font-bold mb-4 text-slate-900">Finanzen & Abrechnung</h2>
      
        <div className="mb-8">
          <RevenueChart data={chartData} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="bg-orange-50 p-4 rounded-full text-orange-500">
            <Euro className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Offener Abrechnungswert (Unerledigt)</h3>
            <p className="text-3xl font-bold mt-1 text-slate-800">{formatEuro(openValue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-500 font-medium text-sm">Abgerechneter Umsatz (Gesamt)</h3>
            <p className="text-3xl font-bold mt-1 text-emerald-600">{formatEuro(closedValue)}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
