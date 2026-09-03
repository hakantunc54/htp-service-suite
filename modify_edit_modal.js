const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

// Update Props
const propsRegex = /interface EditServicesModalProps \{[\s\S]*?onSave: \(services: any\[\]\) => Promise<void>;\s*\}/m;
const newProps = `interface EditServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderType: string;
  availableItems: any[];
  currentServices: any[];
  onSave: (services: any[], technicianRemark?: string) => Promise<void>;
  currentRemark?: string;
}`;
code = code.replace(propsRegex, newProps);

// Update Component signature
const sigRegex = /export function EditServicesModal\(\{[\s\S]*?\}\s*:\s*EditServicesModalProps\)\s*\{/m;
const newSig = `export function EditServicesModal({ isOpen, onClose, orderId, orderType, availableItems, currentServices, onSave, currentRemark }: EditServicesModalProps) {
  const [remark, setRemark] = useState(currentRemark || "");

  useEffect(() => {
    setRemark(currentRemark || "");
  }, [currentRemark, isOpen]);`;
code = code.replace(sigRegex, newSig);

// Update handleSaveClick
const saveClickRegex = /await onSave\(editedServices\.map\(s => \(\{\s*serviceItemId: s\.serviceItemId,\s*quantity: s\.quantity,\s*priceApplied: s\.priceApplied \|\| 0\s*\}\)\)\);/m;
const newSaveClick = `await onSave(editedServices.map(s => ({
          serviceItemId: s.serviceItemId,
          quantity: s.quantity,
          priceApplied: s.priceApplied || 0
        })), remark);`;
code = code.replace(saveClickRegex, newSaveClick);

// Add Textarea to UI before total
const uiRegex = /<\/div>\s*<\/div>\s*<div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">/m;
const newUi = `</div>
            
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bemerkung zur Abrechnung</label>
              <textarea 
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Optionale Bemerkung für diesen Auftrag (erscheint im Export)..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">`;
code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Updated EditServicesModal.tsx");
