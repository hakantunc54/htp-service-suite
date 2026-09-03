const fs = require('fs');
let code = fs.readFileSync('src/app/planning/page.tsx', 'utf8');

// 1. Add X icon
code = code.replace(
  'import { Calendar, Download, Map, CarFront, Trash2, AlertTriangle } from "lucide-react";',
  'import { Calendar, Download, Map, CarFront, Trash2, AlertTriangle, X } from "lucide-react";'
);

// 2. Add state
const stateTarget = 'const [orderToDelete, setOrderToDelete] = useState<string | null>(null);';
const stateNew = `const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportVehicle, setExportVehicle] = useState<string | undefined>(undefined);
  const [exportDate, setExportDate] = useState(() => {
    const d = new Date();
    const localYear = d.getFullYear();
    const localMonth = String(d.getMonth() + 1).padStart(2, '0');
    const localDay = String(d.getDate()).padStart(2, '0');
    return \`\${localYear}-\${localMonth}-\${localDay}\`;
  });`;
code = code.replace(stateTarget, stateNew);

// 3. Update export logic using precise substring replacement
const oldExportStartStr = 'const handleExportCsv = (vehicleName?: string) => {';
const oldExportEndStr = 'document.body.removeChild(link);\n  };';
const startIndex = code.indexOf(oldExportStartStr);
const endIndex = code.indexOf(oldExportEndStr) + oldExportEndStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newExportLogic = `const handleExportClick = (vehicleName?: string) => {
    setExportVehicle(vehicleName);
    setShowExportModal(true);
  };

  const runExportCsv = () => {
    let ordersToExport = exportVehicle 
      ? orders.filter(o => o.vehicle === exportVehicle)
      : orders.filter(o => o.vehicle !== null && o.vehicle !== ""); 

    ordersToExport = ordersToExport.filter(o => {
      if (!o.kundenTerminStart) return true; 
      
      const d = new Date(o.kundenTerminStart);
      const localYear = d.getFullYear();
      const localMonth = String(d.getMonth() + 1).padStart(2, '0');
      const localDay = String(d.getDate()).padStart(2, '0');
      const orderDateStr = \`\${localYear}-\${localMonth}-\${localDay}\`;
      
      return orderDateStr === exportDate;
    });

    if (ordersToExport.length === 0) {
      toast.error(\`Keine Auftr\u00e4ge am ausgew\u00e4hlten Datum \${exportVehicle ? \`f\u00fcr \${exportVehicle} \` : ''}gefunden.\`);
      return;
    }

    ordersToExport.sort((a, b) => {
      if (a.vehicle !== b.vehicle) {
        return (a.vehicle || "").localeCompare(b.vehicle || "");
      }
      if (a.kundenTerminStart && b.kundenTerminStart) {
        return new Date(a.kundenTerminStart).getTime() - new Date(b.kundenTerminStart).getTime();
      }
      return 0;
    });

    const header = [
      "Tour", "Postleitzahl", "Stadt", "Stra\u00dfe", "Hausnummer", 
      "Fahrer", "Port", "Ansprechpartner", "Kundennummer", 
      "Ansprechpartner Telefonnummer", "Notiz", "Name", 
      "Telefon", "Referenz", "Fr\u00fchestens", "Sp\u00e4testens", "Verweildauer"
    ];
    
    const rows = ordersToExport.map(o => {
      const addressStr = o.customer.address || "";
      const parts = addressStr.split(',');
      let streetPart = parts[0]?.trim() || "";
      let cityPart = parts[1]?.trim() || "";

      let plz = "";
      let stadt = "";
      const cityMatch = cityPart.match(/^(\\d{5})\\s+(.*)$/);
      if (cityMatch) {
        plz = cityMatch[1];
        stadt = cityMatch[2];
      } else {
        stadt = cityPart;
      }

      let strasse = streetPart;
      let hausnummer = "";
      const streetMatch = streetPart.match(/^(.*?)(\\s*\\d+[a-zA-Z\\s\\-]*)$/);
      if (streetMatch) {
        strasse = streetMatch[1].trim();
        hausnummer = streetMatch[2].trim();
      }

      const telefon = o.customer.mobile || o.customer.phone || "";

      let notiz = o.orderType || "";
      if (o.vosNumber) notiz += \` | VOS: \${o.vosNumber}\`;
      if (o.estimatedDuration) notiz += \` | \${o.estimatedDuration} geplant\`;
      
      const hist = (o as any).history;
      if (hist && hist.length > 0) {
        notiz += \` | NOTIZ: \${hist[0].content}\`;
      }

      let fruehestens = "08:00";
      let spaetestens = "17:00";
      if (o.kundenTerminStart) {
        const d = new Date(o.kundenTerminStart);
        fruehestens = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
      
      const isBde = o.orderType && o.orderType.toLowerCase().includes('bde');
      const displayName = isBde ? \`BdE: \${o.customer.customerName}\` : o.customer.customerName;

      const row = [
        "", 
        plz,
        stadt,
        strasse,
        hausnummer,
        o.vehicle,
        o.port || "",
        displayName,
        o.customer.customerNumber || "",
        telefon,
        notiz,
        displayName,
        telefon,
        o.id.substring(0, 8),
        fruehestens,
        spaetestens,
        o.estimatedDuration ? o.estimatedDuration.replace(/\\D/g,'') : "0"
      ];

      return row.map(cell => \`"\${(cell || "").replace(/"/g, '""')}"\`);
    });

    const csvContent = [header.join(";"), ...rows.map(r => r.join(";"))].join("\\n");
    
    const blob = new Blob(["\\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fileName = exportVehicle 
      ? \`xRoute_Export_\${exportDate}_\${exportVehicle.replace(' ', '_')}.csv\`
      : \`xRoute_Export_\${exportDate}_Alle_Autos.csv\`;
      
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

    code = code.substring(0, startIndex) + newExportLogic + code.substring(endIndex);
} else {
    console.log("Could not find start or end index for old handleExportCsv");
}

// 5. Update onClick handlers
code = code.replace('onClick={() => handleExportCsv()}', 'onClick={() => handleExportClick()}');
code = code.replace('onClick={() => handleExportCsv(vehicle)}', 'onClick={() => handleExportClick(vehicle)}');
code = code.replace('onClick={() => handleExportCsv(vehicle)}', 'onClick={() => handleExportClick(vehicle)}'); // Might be multiple

// 6. Add Modal UI at the bottom
const modalUI = `
      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Export Datum w\u00e4hlen
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Bitte w\u00e4hlen Sie das Datum f\u00fcr den xRoute Tages-Export {exportVehicle ? \`von \${exportVehicle}\` : 'aller Autos'}.
                Auftr\u00e4ge ohne Fixtermin werden automatisch in den Export inkludiert.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Datum</label>
                <input 
                  type="date"
                  value={exportDate}
                  onChange={e => setExportDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={() => {
                    setShowExportModal(false);
                    runExportCsv();
                  }}
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportieren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/<\/div>\s*\);\s*\}\s*$/, modalUI);

fs.writeFileSync('src/app/planning/page.tsx', code, 'utf8');
console.log("Export Modal implemented successfully with robust replacement!");
