const fs = require('fs');
const newCode = `"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }: { data: any[] }) {
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'week'>('year');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // KW Berechnung
  const getISOWeek = (date: Date) => {
    const dt = new Date(date.valueOf());
    const dayn = (date.getDay() + 6) % 7;
    dt.setDate(dt.getDate() - dayn + 3);
    const firstThursday = dt.valueOf();
    dt.setMonth(0, 1);
    if (dt.getDay() !== 4) {
      dt.setMonth(0, 1 + ((4 - dt.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - dt.getTime()) / 604800000);
  };
  
  const currentWeek = getISOWeek(new Date());
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const monthNames = ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const aggregatedData = useMemo(() => {
    let filtered = data.filter(d => d.year === selectedYear);
    
    if (viewMode === 'year') {
      // Gruppieren nach Monat
      const grouped: Record<number, any> = {};
      for (let i = 0; i < 12; i++) {
        grouped[i] = { label: monthNames[i], FTTB: 0, BDE: 0 };
      }
      filtered.forEach(d => {
        grouped[d.month].FTTB += d.FTTB;
        grouped[d.month].BDE += d.BDE;
      });
      return Object.values(grouped);
    } 
    else if (viewMode === 'month') {
      // Gruppieren nach Tag im Monat
      filtered = filtered.filter(d => d.month === selectedMonth);
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const grouped: Record<number, any> = {};
      for (let i = 1; i <= daysInMonth; i++) {
        grouped[i] = { label: \`\${i}.\`, FTTB: 0, BDE: 0 };
      }
      filtered.forEach(d => {
        grouped[d.day].FTTB += d.FTTB;
        grouped[d.day].BDE += d.BDE;
      });
      return Object.values(grouped);
    }
    else if (viewMode === 'week') {
      // Gruppieren nach Wochentag (Mo-So)
      const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const grouped: Record<number, any> = {};
      for (let i = 0; i < 7; i++) {
        grouped[i] = { label: dayNames[i], FTTB: 0, BDE: 0 };
      }
      
      filtered.forEach(d => {
        const w = getISOWeek(d.dateObj);
        if (w === selectedWeek) {
          let dayOfWeek = d.dateObj.getDay() - 1;
          if (dayOfWeek === -1) dayOfWeek = 6; // Sonntag
          grouped[dayOfWeek].FTTB += d.FTTB;
          grouped[dayOfWeek].BDE += d.BDE;
        }
      });
      return Object.values(grouped);
    }
    
    return [];
  }, [data, viewMode, selectedYear, selectedMonth, selectedWeek]);

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fttb = payload.find((p: any) => p.dataKey === 'FTTB')?.value || 0;
      const bde = payload.find((p: any) => p.dataKey === 'BDE')?.value || 0;
      const total = fttb + bde;
      
      const fttbPerc = total > 0 ? Math.round((fttb / total) * 100) : 0;
      const bdePerc = total > 0 ? Math.round((bde / total) * 100) : 0;

      let titleLabel = label;
      if (viewMode === 'year') titleLabel = \`\${label} \${selectedYear}\`;
      if (viewMode === 'month') titleLabel = \`\${label} \${monthNames[selectedMonth]} \${selectedYear}\`;
      if (viewMode === 'week') titleLabel = \`\${label}, KW \${selectedWeek} \${selectedYear}\`;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md z-50 relative">
          <p className="font-bold text-gray-800 mb-2">{titleLabel}</p>
          <div className="flex justify-between items-center gap-4 mb-1 text-sm text-blue-600">
            <span>FTTB:</span>
            <span className="font-semibold">{formatEuro(fttb)} ({fttbPerc}%)</span>
          </div>
          <div className="flex justify-between items-center gap-4 mb-2 text-sm text-red-600">
            <span>BDE:</span>
            <span className="font-semibold">{formatEuro(bde)} ({bdePerc}%)</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center gap-4 font-bold text-gray-800">
            <span>Gesamt:</span>
            <span>{formatEuro(total)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Umsatzstatistik</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-700 outline-none text-sm font-medium"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
          >
            <option value="year">Jahresansicht</option>
            <option value="month">Monatsansicht</option>
            <option value="week">Wochenansicht</option>
          </select>

          {viewMode === 'week' && (
            <div className="flex items-center border border-gray-300 rounded bg-gray-50 overflow-hidden">
              <span className="px-2 text-sm text-gray-500 font-medium border-r border-gray-300">KW</span>
              <input 
                type="number" 
                min={1} 
                max={53}
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-14 px-2 py-1.5 bg-transparent text-gray-700 outline-none text-sm font-medium"
              />
            </div>
          )}

          {viewMode === 'month' && (
            <select 
              className="border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-700 outline-none text-sm font-medium"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          )}

          <select 
            className="border border-gray-300 rounded px-3 py-1.5 bg-gray-50 text-gray-700 outline-none text-sm font-medium"
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[400px] w-full">
        {aggregatedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={aggregatedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis 
                tickFormatter={(value) => \`\${(value/1000).toFixed(0)}k \u20ac\`}
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6B7280', fontSize: 12}}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
              <Bar dataKey="FTTB" stackId="a" fill="#2563EB" radius={[0, 0, 4, 4]} barSize={viewMode === 'month' ? 12 : 40} />
              <Bar dataKey="BDE" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Keine Daten vorhanden
          </div>
        )}
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/RevenueChart.tsx', newCode, 'utf8');
console.log("Replaced RevenueChart");
