"use client";

import { useState } from "react";
import { parseHtpEmail, ParsedOrder } from "@/lib/parser";
import { saveImportedOrders, checkImportWarnings } from "./actions";
import { Upload, Mail, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

export default function ImportPage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedOrder[]>([]);
  const [warnings, setWarnings] = useState<string[][]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error" | "analyzing">("idle");

  const handleParse = async () => {
    setStatus("analyzing");
    const results = parseHtpEmail(text);
    
    if (results.length === 0 && text.trim()) {
      toast.error("Keine Aufträge in diesem Text gefunden.");
      setWarnings([]);
    } else if (results.length > 0) {
      toast.success(`${results.length} Aufträge erfolgreich erkannt! Analysiere CRM-Historie...`);
      const apiWarnings = await checkImportWarnings(results);
      setWarnings(apiWarnings);
    }
    
    setParsed(results);
    setStatus("idle");
  };

  const handleSave = async () => {
    setStatus("saving");
    const result = await saveImportedOrders(parsed);
    if (result.success) {
      toast.success(`${parsed.length} Aufträge in die Datenbank importiert!`);
      setStatus("success");
      setParsed([]);
      setWarnings([]);
      setText("");
    } else {
      toast.error("Fehler beim Speichern der Aufträge.");
      setStatus("error");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Upload className="w-8 h-8 text-blue-600" />
        Smart Import
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          htp E-Mail Text hier einfügen
        </label>
        <textarea
          className="w-full h-48 border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="Betreff: Bereitstellung FTTB..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleParse}
            disabled={!text.trim() || status === "analyzing"}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === "analyzing" ? "Analysiere..." : "E-Mail analysieren"}
          </button>
        </div>
      </div>

      {parsed.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <Mail className="w-5 h-5 text-gray-500" />
            Erkannte Aufträge ({parsed.length})
          </h2>
          
          <div className="grid gap-4">
            {parsed.map((order, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{order.customerName}</h3>
                    <p className="text-slate-600 text-sm">{order.address}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {order.orderType}
                  </span>
                </div>
                
                {/* Warnungen / Historien-Check */}
                {warnings[index] && warnings[index].length > 0 && (
                  <div className="mb-4 flex flex-col gap-2">
                    {warnings[index].map((w, wIdx) => {
                      const isBuilding = w.includes("Gebäude");
                      return (
                        <div key={wIdx} className={`p-3 rounded-lg flex items-start gap-2 text-sm ${isBuilding ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-blue-50 text-blue-900 border border-blue-200"}`}>
                          {isBuilding ? <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" /> : <Info className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />}
                          <span className="font-medium">{w}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="block text-gray-500 text-xs uppercase mb-1">Kd-Nr.</span>
                    <span className="font-medium">{order.customerNumber || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs uppercase mb-1">Telefon</span>
                    <span className="font-medium">{order.phone || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs uppercase mb-1">Planfenster</span>
                    <span className="font-medium">{order.htpPlanfenster || "-"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              {status === "saving" ? "Speichere..." : "Alle Aufträge ins CRM importieren"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
