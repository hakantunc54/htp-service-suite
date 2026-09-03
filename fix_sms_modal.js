const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// Add a state for the manual SMS copy modal
const stateRegex = /const \[note, setNote\] = useState\(""\);/m;
const newState = `const [note, setNote] = useState("");
  const [manualSmsText, setManualSmsText] = useState("");
  const [showManualSmsModal, setShowManualSmsModal] = useState(false);`;
code = code.replace(stateRegex, newState);

// Update handleSmsAction
const smsRegex = /const handleSmsAction = async \(templateName: string\) => \{[\s\S]*?toast\.error\("Fehler beim Kopieren in die Zwischenablage\."\);\s*\}/m;
const newSmsAction = `const handleSmsAction = async (templateName: string) => {
    if (!order) return;
    const template = templates.find(t => t.name === templateName);
    if (!template) return;

    let content = template.content.replace("{name}", order.customer.customerName);
    
    // Fallback if HTTPS is not available
    if (!navigator.clipboard && !window.isSecureContext) {
      setManualSmsText(content);
      setShowManualSmsModal(true);
      await addHistoryEntry(order.id, "SMS", \`SMS '\${templateName}' generiert (Manuelles Kopieren).\`);
      await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
      fetchData();
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success("SMS kopiert! Google Messages öffnet sich...", { duration: 4000 });
      window.open("https://messages.google.com/web/", "_blank");
      await addHistoryEntry(order.id, "SMS", \`SMS '\${templateName}' generiert und kopiert.\`);
      await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
      fetchData();
    } catch (err) {
      console.error("Failed to copy", err);
      // Even if navigator.clipboard is defined, it might fail if permission is denied.
      setManualSmsText(content);
      setShowManualSmsModal(true);
      await addHistoryEntry(order.id, "SMS", \`SMS '\${templateName}' generiert (Manuelles Kopieren).\`);
      await updateOrderStatus(order.id, order.status, CommunicationStatus.SMS_GESENDET);
      fetchData();
    }
  }`;
code = code.replace(smsRegex, newSmsAction);

// Add the modal UI
const uiRegex = /\{showEditModal && \(\s*<EditServicesModal/m;
const newUi = `{showManualSmsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Manuelles Kopieren nötig
              </h2>
              <button onClick={() => setShowManualSmsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Da du über eine lokale IP-Adresse (HTTP) zugreifst, blockiert der Browser das automatische Kopieren. 
                Bitte markiere den Text unten (oder drücke <strong>Strg + A</strong> und <strong>Strg + C</strong>) und öffne dann Google Messages.
              </p>
              <textarea 
                className="w-full h-48 p-4 border border-blue-200 bg-blue-50/30 rounded-xl outline-none font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500"
                value={manualSmsText}
                readOnly
                autoFocus
                onFocus={(e) => e.target.select()}
              />
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
                onClick={() => setShowManualSmsModal(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Google Messages öffnen
              </a>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditServicesModal`;
code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Replaced handleSmsAction with manual modal fallback");
