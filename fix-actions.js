const fs = require("fs");
let content = fs.readFileSync("src/app/orders/[id]/actions.ts", "utf8");

const replacement = `
    // Update order value
    const existingOrder = await tx.order.findUnique({ where: { id: orderId } });
    
    let updateData = {
      orderValue: newOrderValue,
      ...(newRemark !== undefined && { technicianRemark: newRemark }),
      ...(newBdeStatus !== undefined && { bdeStatus: newBdeStatus }),
      ...(newMaterialDetails !== undefined && { materialDetails: newMaterialDetails })
    };

    if (existingOrder && existingOrder.isBilled) {
      const serviceItemIds = servicesToSave.map(s => s.serviceItemId);
      const billedServiceItems = await tx.serviceItem.findMany({
        where: { id: { in: serviceItemIds } }
      });
      const hasAbbruch = billedServiceItems.some(si => 
        si.name.toLowerCase().includes("abbruch") || si.name.toLowerCase().includes("kvhdf")
      );
      const finalStatus = (hasAbbruch || newBdeStatus === "Abbruch") ? "Abbruch" : "Erfolgreich abgeschlossen";
      updateData.status = finalStatus;
    }

    await tx.order.update({
      where: { id: orderId },
      data: updateData
    });
`;

content = content.replace(/\/\/ Update order value\n\s*await tx\.order\.update\({\n\s*where: { id: orderId },\n\s*data: {\s*orderValue: newOrderValue,\n\s*\.\.\.\(newRemark !== undefined && { technicianRemark: newRemark }\),\n\s*\.\.\.\(newBdeStatus !== undefined && { bdeStatus: newBdeStatus }\),\n\s*\.\.\.\(newMaterialDetails !== undefined && { materialDetails: newMaterialDetails }\)\n\s*}\n\s*}\);/g, replacement);

fs.writeFileSync("src/app/orders/[id]/actions.ts", content, "utf8");
console.log("Fixed updateOrderServices");
