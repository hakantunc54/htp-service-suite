const fs = require('fs');
let code = fs.readFileSync('src/components/EditServicesModal.tsx', 'utf8');

const regex = /interface EditServicesModalProps \{[\s\S]*?orderType: string;\s*\}/m;
const newProps = `interface EditServicesModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  currentServices: OrderService[];
  availableItems: ServiceItem[];
  onSave: (newServices: any[], newRemark?: string) => Promise<void>;
  orderType: string;
  currentRemark?: string;
}`;

code = code.replace(regex, newProps);
fs.writeFileSync('src/components/EditServicesModal.tsx', code, 'utf8');
console.log("Fixed EditServicesModalProps");
