const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

// Update Props interface
const propsRegex = /onSave: \(newServices: any\[\], newRemark\?: string\) => Promise<void>;\s*orderType: string;\s*currentRemark\?: string;/m;
const newProps = `onSave: (newServices: any[], newRemark?: string, newBdeStatus?: string, newMaterialDetails?: string) => Promise<void>;
  orderType: string;
  currentRemark?: string;
  currentBdeStatus?: string;
  currentMaterialDetails?: string;`;
code = code.replace(propsRegex, newProps);

// Update component signature
const sigRegex = /export function EditServicesModal\(\{ isOpen, onClose, orderId, orderType, availableItems, currentServices, onSave, currentRemark \}: EditServicesModalProps\) \{/m;
const newSig = `export function EditServicesModal({ isOpen, onClose, orderId, orderType, availableItems, currentServices, onSave, currentRemark, currentBdeStatus, currentMaterialDetails }: EditServicesModalProps) {`;
code = code.replace(sigRegex, newSig);

// Add states
const stateRegex = /const \[remark, setRemark\] = useState\(currentRemark \|\| ""\);\s*useEffect\(\(\) => \{\s*setRemark\(currentRemark \|\| ""\);\s*\}, \[currentRemark, isOpen\]\);/m;
const defaultTemplate = `Zeitaufwand: 1 Techniker 2,00 Std.
Materialaufwand: 
- 10m ISTY (15,00 EUR)
- 5m Verlegematerial (7,50 EUR)
- 1 x TAE Dose AP (15 EUR)`;

const newState = `const [remark, setRemark] = useState(currentRemark || "");
  const [bdeStatus, setBdeStatus] = useState(currentBdeStatus || "BDE erledigt - neuer Bautermin erforderlich");
  const [materialDetails, setMaterialDetails] = useState(currentMaterialDetails || \`${defaultTemplate}\`);

  useEffect(() => {
    setRemark(currentRemark || "");
    if (currentBdeStatus) setBdeStatus(currentBdeStatus);
    if (currentMaterialDetails) setMaterialDetails(currentMaterialDetails);
  }, [currentRemark, currentBdeStatus, currentMaterialDetails, isOpen]);
  
  const isBDE = (orderType || "").toLowerCase().includes("bde") || (orderType || "").toLowerCase().includes("endleitung");
  `;
code = code.replace(stateRegex, newState);

// Update handleSaveClick
const saveClickRegex = /await onSave\(editedServices\.map\(s => \(\{\s*serviceItemId: s\.serviceItemId,\s*quantity: s\.quantity,\s*priceApplied: s\.priceApplied \|\| 0\s*\}\)\), remark\);/m;
const newSaveClick = `await onSave(editedServices.map(s => ({
          serviceItemId: s.serviceItemId,
          quantity: s.quantity,
          priceApplied: s.priceApplied || 0
        })), remark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined);`;
code = code.replace(saveClickRegex, newSaveClick);

// Add UI fields
const uiRegex = /<div className="mt-6">\s*<label className="block text-sm font-semibold text-gray-700 mb-2">Bemerkung zur Abrechnung<\/label>/m;
const newUi = `{isBDE && (
              <>
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BDE Status (für Excel-Export)</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={bdeStatus}
                    onChange={(e) => setBdeStatus(e.target.value)}
                  >
                    <option value="BDE erledigt - neuer Bautermin erforderlich">BDE erledigt - neuer Bautermin erforderlich</option>
                    <option value="BDE erledigt - TAL in Betrieb">BDE erledigt - TAL in Betrieb</option>
                    <option value="Abbruch">Abbruch</option>
                  </select>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stunden / Material (für Excel-Export)</label>
                  <textarea 
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={materialDetails}
                    onChange={(e) => setMaterialDetails(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Dieser Text wird 1:1 in die Spalte "Stunden / Material" exportiert.</p>
                </div>
              </>
            )}
            
            <div className="mt-6 border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bemerkung zur Abrechnung</label>`;
code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Updated EditServicesModal");
