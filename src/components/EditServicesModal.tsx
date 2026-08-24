"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ServiceItem {
  id: string;
  name: string;
  defaultPrice: number | null;
  category: string;
}

interface OrderService {
  serviceItemId: string;
  quantity: number;
  priceApplied: number;
  serviceItem?: ServiceItem;
}

interface EditServicesModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  currentServices: OrderService[];
  availableItems: ServiceItem[];
  onSave: (newServices: any[]) => Promise<void>;
  orderType: string;
}

export function EditServicesModal({ orderId, isOpen, onClose, currentServices, availableItems, onSave, orderType }: EditServicesModalProps) {
  const [editedServices, setEditedServices] = useState<OrderService[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedServices(JSON.parse(JSON.stringify(currentServices)));
    }
  }, [isOpen, currentServices]);

  if (!isOpen) return null;

  const handleUpdateQuantity = (itemId: string, defaultPrice: number | null, change: number) => {
    setEditedServices(prev => {
      const existingIdx = prev.findIndex(s => s.serviceItemId === itemId);
      let newServices = [...prev];
      
      if (existingIdx >= 0) {
        const item = newServices[existingIdx];
        item.quantity += change;
        if (item.quantity <= 0) {
          newServices.splice(existingIdx, 1);
        }
      } else if (change > 0) {
        newServices.push({
          serviceItemId: itemId,
          quantity: 1,
          priceApplied: defaultPrice || 0
        });
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

  const conflict = hasFttb && (hasKvhdf || hasKeinZugang);

  const calculateTotal = () => {
    return editedServices.reduce((sum, item) => sum + (item.priceApplied * item.quantity), 0);
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
        priceApplied: s.priceApplied
      })));
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
                <strong>Logik-Konflikt!</strong> Du hast eine FTTB-Installation ausgewählt UND gleichzeitig einen Abbruch (KvHdF oder Kein Zugang). Bitte korrigiere die Auswahl!
              </div>
            </div>
          )}

          <div className="space-y-4">
            {availableItems.filter(item => item.category === 'ALL' || orderType.includes(item.category)).map(item => {
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
                  
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.defaultPrice, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                      disabled={qty === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-700">{qty}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.defaultPrice, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
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
