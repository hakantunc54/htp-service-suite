"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }: { data: any[] }) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);

  const filteredData = data.filter(d => d.year === year);

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

      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold text-gray-800 mb-2">{label} {year}</p>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Umsatzstatistik</h2>
        <select 
          className="border border-gray-300 rounded px-3 py-1 bg-gray-50 text-gray-700 outline-none"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-[400px] w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <YAxis 
                tickFormatter={(value) => `${value.toLocaleString('de-DE')} '`}
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6B7280'}}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Legend iconType="circle" />
              <Bar dataKey="FTTB" stackId="a" fill="#2563EB" radius={[0, 0, 4, 4]} barSize={40} />
              <Bar dataKey="BDE" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Keine Daten f\u00fcr {year} vorhanden
          </div>
        )}
      </div>
    </div>
  );
}
