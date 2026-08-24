"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  name: string;
  defaultPrice: number | null;
  category: string;
}

interface OrderService {
  serviceItemId: string;
  quantity: number;
  priceApplied: number | null;
  serviceItem?: ServiceItem;
}

interface EditServicesModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  currentServices: OrderService[];
  availableItems: ServiceItem[];
  onSave: (newServices: any[], newRemark?: string, newBdeStatus?: string, newMaterialDetails?: string) => Promise<void>;
  orderType: string;
  currentRemark?: string;
  currentBdeStatus?: string;
  currentMaterialDetails?: string;
}

export function EditServicesModal({ isOpen, onClose, orderId, orderType, availableItems, currentServices, onSave, currentRemark, currentBdeStatus, currentMaterialDetails }: EditServicesModalProps) {
  const [remark, setRemark] = useState(currentRemark || "");
  const [bdeStatus, setBdeStatus] = useState(currentBdeStatus || "BDE erledigt - neuer Bautermin erforderlich");
  const [materialDetails, setMaterialDetails] = useState(currentMaterialDetails || `Zeitaufwand: 1 Techniker 2,00 Std.
Materialaufwand: 
- 10m ISTY (15,00 EUR)
- 5m Verlegematerial (7,50 EUR)
- 1 x TAE Dose AP (15 EUR)`);

  useEffect(() => {
    setRemark(currentRemark || "");
    if (currentBdeStatus) setBdeStatus(currentBdeStatus);
    if (currentMaterialDetails) setMaterialDetails(currentMaterialDetails);
  }, [currentRemark, currentBdeStatus, currentMaterialDetails, isOpen]);
  
  const isBDE = (orderType || "").toLowerCase().includes("bde") || (orderType || "").toLowerCase().includes("endleitung");
  
  const [editedServices, setEditedServices] = useState<OrderService[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedServices(JSON.parse(JSON.stringify(currentServices)));
    }
  }, [isOpen, currentServices]);

  if (!isOpen) return null;

  const handleSetQuantity = (itemId: string, defaultPrice: number | null, rawValue: string) => {
    // Erlaube leere Eingaben whrend des Tippens (werden als 0 gewertet)
    const val = rawValue.trim() === '' ? 0 : parseFloat(rawValue.replace(',', '.'));
    const qty = isNaN(val) ? 0 : val;

    setEditedServices(prev => {
      const existingIdx = prev.findIndex(s => s.serviceItemId === itemId);
      let newServices = [...prev];
      
      if (existingIdx >= 0) {
        if (qty <= 0) {
          newServices.splice(existingIdx, 1);
        } else {
          newServices[existingIdx].quantity = qty;
        }
      } else if (qty > 0) {
        newServices.push({ serviceItemId: itemId, quantity: qty, priceApplied: defaultPrice || 0 });
      }
      return newServices;
    });
  };

  const hasFttb = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name.includes("FTTB");
  });

  const hasKvhdf = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "KvHdF";
  });

  const hasKeinZugang = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "fZugang DPU/APL";
  });
  
  const hasAbbruch = editedServices.some(s => {
    const si = availableItems.find(i => i.id === s.serviceItemId);
    return si && si.name === "Abbruch";
  });

  const conflict = hasFttb && (hasKvhdf || hasKeinZugang || hasAbbruch);

  const calculateTotal = () => {
    return editedServices.reduce((sum, item) => sum + ((item.priceApplied || 0) * item.quantity), 0);
  };

  const handleSaveClick = async () => {
    if (conflict) {
      toast.error("Konflikt: Du kannst nicht 'FTTB Bereitstellung' und gleichzeitig 'Abbruch/Kein Zugang' abrechnen!");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(editedServices.map(s => ({
          serviceItemId: s.serviceItemId,
          quantity: s.quantity,
          priceApplied: s.priceApplied || 0
        })), remark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined);
      onClose();
    } catch (e) {
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Leistungen bearbeiten</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {conflict && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-200">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Logik-Konflikt!</strong> Du hast eine FTTB-Installation ausgewhlt UND gleichzeitig einen Abbruch (KvHdF oder Kein Zugang). Bitte korrigiere die Auswahl!
              </div>
            </div>
          )}

          <div className="space-y-4">
            
            {(() => {
              const isBDE = (orderType || "").toLowerCase().includes("bde") || (orderType || "").toLowerCase().includes("endleitung");
              const category = isBDE ? "BDE" : "FTTB";
              
              const bdeOrder = ["Arbeitszeit (Std.)", "Material (BDE)", "Optional (BDE)"];
              const fttbOrder = ["FTTB", "Abbruch", "MAW (5Min)", "PCI", "vLauiAPLe", "Warten 5Min", "Warten 10Min", "fZugang DPU/APL", "KvHdF", "Dispo", "Optional / Material (FTTB)"];
              const sortOrder = isBDE ? bdeOrder : fttbOrder;
              
              return availableItems
                .filter(item => item.category === category)
                .filter(item => !item.name.toLowerCase().includes("anfahrt"))
                .sort((a, b) => {
                  const indexA = sortOrder.indexOf(a.name);
                  const indexB = sortOrder.indexOf(b.name);
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                });
  
            })().map(item => {
              const current = editedServices.find(s => s.serviceItemId === item.id);
              const qty = current ? current.quantity : 0;
              
              // Highlight selected
              const isSelected = qty > 0;
              
              return (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${isSelected ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white'}`}>
                  <div>
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.defaultPrice?.toFixed(2).replace('.', ',')} EUR</div>
                  </div>
                  
                  <div className="w-24">
                      <input 
                        type="number"
                        min="0"
                        step={item.name.toLowerCase().includes("arbeitszeit") || item.name.toLowerCase().includes("bde") ? "0.01" : "1"}
                        className="w-full text-right border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 outline-none text-sm bg-gray-50 border"
                        value={qty || ""}
                        placeholder="0"
                        onChange={(e) => handleSetQuantity(item.id, item.defaultPrice, e.target.value)}
                      />
                    </div>
                </div>
              );
            })}
          </div>
            
            {isBDE && (
              <>
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BDE Status (f�r Excel-Export)</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stunden / Material (f�r Excel-Export)</label>
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

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Neuer Gesamtpreis: <br/>
            <strong className="text-lg text-slate-800">{calculateTotal().toFixed(2).replace('.', ',')} EUR</strong>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors">Abbrechen</button>
            <button 
              onClick={handleSaveClick} 
              disabled={isSaving || conflict}
              className="px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
