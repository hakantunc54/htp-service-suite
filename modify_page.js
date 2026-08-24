const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// Update handleSaveServices
const saveFnRegex = /const handleSaveServices = async \(newServices: any\[\]\) => \{\s*if \(\!order\) return;\s*const res = await updateOrderServices\(order\.id, newServices\);\s*if \(res\.success\) \{\s*toast\.success\("Leistungen erfolgreich aktualisiert!"\);\s*await fetchData\(\);\s*\}\s*\};/m;
const newSaveFn = `const handleSaveServices = async (newServices: any[], newRemark?: string) => {
    if (!order) return;
    const res = await updateOrderServices(order.id, newServices, newRemark);
    if (res.success) {
      toast.success("Leistungen & Bemerkung erfolgreich aktualisiert!");
      await fetchData();
    }
  };`;
code = code.replace(saveFnRegex, newSaveFn);

// Update Modal Props
const modalRegex = /<EditServicesModal\s*isOpen=\{isServicesModalOpen\}\s*onClose=\{\(\) => setIsServicesModalOpen\(false\)\}\s*orderId=\{order\.id\}\s*orderType=\{order\.orderType \|\| ""\}\s*availableItems=\{availableItems\}\s*currentServices=\{order\.services\}\s*onSave=\{handleSaveServices\}\s*\/>/m;
const newModal = `<EditServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        orderId={order.id}
        orderType={order.orderType || ""}
        availableItems={availableItems}
        currentServices={order.services}
        onSave={handleSaveServices}
        currentRemark={order.technicianRemark || ""}
      />`;
code = code.replace(modalRegex, newModal);

fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
console.log("Updated orders/[id]/page.tsx");
