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

  
  // Hole alle potenziellen R�ckrufe und filtere FTTB hart in JavaScript heraus
  const rawCallbacks = await prisma.order.findMany({
    where: {
      OR: [
        { status: "Neu" },
        { status: "Kunde nicht erreicht" },
        { status: "Kunde hat zur�ckgerufen" },
        { status: "Kunde hat zurOckgerufen" }
      ],
      communicationStatus: { notIn: ["Termin best�tigt", "Termin besttigt"] }
    },
    select: { orderType: true, vosNumber: true, status: true, kundenTerminStart: true }
  });

  const callbacksToday = rawCallbacks.filter(o => {
    // Wenn es ein echter eingestellter FTTB (ohne vosNumber und ohne "BDE" im Namen) ist, komplett ignorieren!
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || 
                  (o.orderType || "").toLowerCase().includes("endleitung") || 
                  o.vosNumber;
                  
    // FTTB ignorieren, wir z�hlen nur BDEs!
    if (!isBDE) return false;
    
    // Bei BDEs: Z�hlen, wenn Termin fehlt ODER Kunde explizit auf R�ckruf steht
    if (o.status === "Neu" && o.kundenTerminStart !== null) return false; 
    
    return true;
  }).length;

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
  let closedValue = billedData._sum.orderValue || 0;

  
  // All completed orders for the chart
  const allBilledOrders = await prisma.order.findMany({
    where: { status: "Erfolgreich abgeschlossen" },
    select: { orderValue: true, orderType: true, kundenTerminStart: true, updatedAt: true, vosNumber: true, vehicle: true }
  });

  const monthNames = ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  
  const chartDataMap: Record<string, any> = {};
  
  // Track Anfahrten grouped by Date+Vehicle+Type
  const anfahrtGroups: {
    FTTB: Record<string, { year: number; month: number; count: number }>;
    BDE: Record<string, { year: number; month: number; count: number }>;
  } = {
    FTTB: {},
    BDE: {}
  };

  allBilledOrders.forEach(o => {
    const date = o.kundenTerminStart || o.updatedAt;
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!chartDataMap[key]) {
      chartDataMap[key] = { year, month, monthName: monthNames[month], FTTB: 0, BDE: 0 };
    }
    
    const val = o.orderValue || 0;
    const isBDE = (o.orderType || "").toLowerCase().includes("bde") || (o.orderType || "").toLowerCase().includes("endleitung") || o.vosNumber;
    const type = isBDE ? "BDE" : "FTTB";
    
    // Add base order value
    chartDataMap[key][type] += val;
    
    // Track for Anfahrt calculation
    const dateStr = date.toISOString().split('T')[0];
    const groupKey = `${dateStr}_${o.vehicle || 'Pool'}`;
    
    if (type === "FTTB") {
      if (!anfahrtGroups.FTTB[groupKey]) anfahrtGroups.FTTB[groupKey] = { year, month, count: 0 };
      anfahrtGroups.FTTB[groupKey].count += 1;
    } else {
      if (!anfahrtGroups.BDE[groupKey]) anfahrtGroups.BDE[groupKey] = { year, month, count: 0 };
      anfahrtGroups.BDE[groupKey].count += 1;
    }
  });
  
  // Fetch dynamic prices for Anfahrt
  const serviceItems = await prisma.serviceItem.findMany({
    where: { name: { contains: "Anfahrt" } }
  });
  
  const priceFttbLt12 = serviceItems.find(i => i.name.includes("<12"))?.defaultPrice || 85;
  const priceFttbGt12 = serviceItems.find(i => i.name.includes(">12"))?.defaultPrice || 50;
  const priceBde = serviceItems.find(i => i.name.includes("BDE") || i.name.includes("BdE"))?.defaultPrice || 60;

  // Apply FTTB Anfahrt
  Object.values(anfahrtGroups.FTTB).forEach(group => {
    const key = `${group.year}-${group.month}`;
    if (group.count > 0) {
      const anfahrtPreis = group.count >= 12 ? priceFttbGt12 : priceFttbLt12;
      chartDataMap[key]["FTTB"] += anfahrtPreis;
      closedValue += anfahrtPreis;
    }
  });

  // Apply BDE Anfahrt
  Object.values(anfahrtGroups.BDE).forEach(group => {
    const key = `${group.year}-${group.month}`;
    if (group.count > 0) {
      chartDataMap[key]["BDE"] += priceBde;
      closedValue += priceBde;
    }
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
