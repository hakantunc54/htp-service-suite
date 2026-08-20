"use client";

import { useState } from "react";
import { parseHtpEmail, ParsedOrder } from "@/lib/parser";
import { saveImportedOrders, checkImportWarnings, saveHistoricalExcelData } from "./actions";
import { Upload, Mail, CheckCircle2, AlertTriangle, Info, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as xlsx from "xlsx";

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<"email" | "excel">("email");

  // Email State
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedOrder[]>([]);
  const [warnings, setWarnings] = useState<string[][]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error" | "analyzing">("idle");

  // Excel State
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [excelStatus, setExcelStatus] = useState<"idle" | "analyzing" | "saving" | "success">("idle");
  const [excelStats, setExcelStats] = useState({ fttb: 0, bde: 0, total: 0 });
  const [priceOverridesMap, setPriceOverridesMap] = useState<Record<string, number>>({});

  const handleParseEmail = async () => {
    setStatus("analyzing");
    const results = parseHtpEmail(text);
    
    if (results.length === 0 && text.trim()) {
      toast.error("Keine Aufträge in diesem Text gefunden.");
      setWarnings([]);
    } else if (results.length > 0) {
      toast.success(results.length + " Aufträge erfolgreich erkannt!");
      const apiWarnings = await checkImportWarnings(results);
      setWarnings(apiWarnings);
    }
    
    setParsed(results);
    setStatus("idle");
  };

  const handleSaveEmail = async () => {
    setStatus("saving");
    const result = await saveImportedOrders(parsed);
    if (result.success) {
      toast.success(parsed.length + " Aufträge in die Datenbank importiert!");
      setStatus("success");
      setParsed([]);
      setWarnings([]);
      setText("");
    } else {
      toast.error("Fehler beim Speichern.");
      setStatus("error");
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelStatus("analyzing");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = xlsx.read(bstr, { type: 'binary', cellDates: true });
        
        let allRows: any[] = [];
        let fttbCount = 0;
        let bdeCount = 0;

        
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          // Lese als 2D Array um die Header-Zeile zu finden
          const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
          
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(rawData.length, 20); i++) {
            const rowArr = (rawData[i] as any[]) || [];
            const rowStr = rowArr.join(" ").toLowerCase();
            if (rowStr.includes("plz") || rowStr.includes("kunde") || rowStr.includes("termin")) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex >= 0) {
            // Generiere JSON ab der gefundenen Header-Zeile
            const data = xlsx.utils.sheet_to_json(ws, { range: headerRowIndex });
            
            const isBde = sheetName.toUpperCase().includes('BDE');
            const isFttb = sheetName.toUpperCase().includes('FTTB');
            
            data.forEach((r: any) => r._SourceType = isBde ? "BDE" : "FTTB");
            
            allRows = allRows.concat(data);
            if (isBde) bdeCount += data.length;
            else fttbCount += data.length;
          }
        });


        setExcelStats({ fttb: fttbCount, bde: bdeCount, total: allRows.length });
        setExcelRows(allRows);
        setExcelStatus("idle");
        toast.success(allRows.length + " Zeilen erfolgreich eingelesen!");
      } catch (err) {
        console.error(err);
        toast.error("Fehler beim Lesen der Excel-Datei.");
        setExcelStatus("idle");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveExcel = async () => {
    setExcelStatus("saving");
    try {
      const plainRows = JSON.parse(JSON.stringify(excelRows));
      const result = await saveHistoricalExcelData(plainRows, priceOverridesMap);
      if (result.success) {
        toast.success(result.count + " historische Aufträge erfolgreich importiert!");
        setExcelStatus("success");
        setExcelRows([]);
      } else {
        toast.error("Fehler beim Importieren: " + result.error);
        setExcelStatus("idle");
      }
    } catch (e) {
      toast.error("Server-Fehler.");
      setExcelStatus("idle");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Upload className="w-8 h-8 text-blue-600" />
        Import Center
      </h1>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab("email")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "email" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <Mail className="w-5 h-5" /> HTP E-Mails
        </button>
        <button 
          onClick={() => setActiveTab("excel")}
          className={"flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors " + (activeTab === "excel" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")}
        >
          <FileSpreadsheet className="w-5 h-5" /> Excel Historie (01.01. - 31.07.)
        </button>
      </div>
      
      {activeTab === "email" && (
        <>
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
                onClick={handleParseEmail}
                disabled={!text.trim() || status === "analyzing"}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {status === "analyzing" ? "Analysiere..." : "E-Mail analysieren"}
              </button>
            </div>
          </div>

          {parsed.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSaveEmail}
                  disabled={status === "saving"}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {status === "saving" ? "Speichere..." : "Alle Aufträge ins CRM importieren"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "excel" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-in fade-in">
          <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 mb-6">
            <FileSpreadsheet className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Alte Abrechnungstabelle hochladen</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Lade deine Excel-Tabellen hoch. Das CRM liest "Kunden Nummer", "WE Lage", "Bemerkung" und die Rechnungspositionen automatisch aus und legt die alten Aufträge als "Abgerechnet" in der Datenbank ab.
            </p>
            <label className="bg-white border border-blue-200 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 cursor-pointer transition-colors shadow-sm inline-block">
              Excel-Datei (.xlsx) auswählen
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
            </label>
          </div>

          {excelRows.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" /> Analyse-Ergebnis
              </h4>
              <div className="flex gap-8 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex-1 text-center">
                  <div className="text-3xl font-black text-blue-600">{excelStats.fttb}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">FTTB Zeilen</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex-1 text-center">
                  <div className="text-3xl font-black text-blue-600">{excelStats.bde}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">BDE Zeilen</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex-1 text-center">
                  <div className="text-3xl font-black text-blue-600">{excelStats.total}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Gesamt</div>
                </div>
              </div>

              <button
                onClick={handleSaveExcel}
                disabled={excelStatus === "saving"}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                {excelStatus === "saving" ? "Import läuft (Das kann dauern)..." : "Jetzt in die CRM Historie importieren"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
