const fs = require('fs');
let code = fs.readFileSync('src/app/import/page.tsx', 'utf8');

// Add targetDate state
const stateRegex = /const \[warnings, setWarnings\] = useState<string\[\]\[\]>\(\[\]\);\s*const \[status, setStatus\] = useState<"idle" \| "saving" \| "success" \| "error" \| "analyzing">\(.*\);/m;
const newState = `const [warnings, setWarnings] = useState<string[][]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error" | "analyzing">("idle");
  const [targetDate, setTargetDate] = useState("");`;
code = code.replace(stateRegex, newState);

// Update save call
const saveRegex = /const result = await saveImportedOrders\(parsed\);/m;
const newSave = `const result = await saveImportedOrders(parsed, targetDate);`;
code = code.replace(saveRegex, newSave);

// Add UI input
const uiRegex = /\{parsed\.length > 0 && \(\s*<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">/m;
const newUi = `{parsed.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Import-Datum (Optional)</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Wenn du hier ein Datum eingibst, werden alle diese Auftr\u00e4ge direkt auf dieses Datum 
                  festgelegt und landen sofort unter <strong>"Termin vereinbart"</strong> (in der Disposition / Abrechnung).
                </p>
                <div className="flex gap-4 items-center">
                  <input 
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {targetDate && <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">Termine werden auf den {new Date(targetDate).toLocaleDateString('de-DE')} gebucht!</span>}
                </div>
              </div>`;

code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/app/import/page.tsx', code, 'utf8');
console.log("Updated import UI");
