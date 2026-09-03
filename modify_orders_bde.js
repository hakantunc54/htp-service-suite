const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Add state
const stateRegex = /const \[technicianRemark, setTechnicianRemark\] = useState\(""\);/m;
const newState = `const [technicianRemark, setTechnicianRemark] = useState("");
  const [bdeStatus, setBdeStatus] = useState("BDE erledigt - neuer Bautermin erforderlich");
  const [materialDetails, setMaterialDetails] = useState("Zeitaufwand: 1 Techniker 2,00 Std.\\nMaterialaufwand: \\n- 10m ISTY (15,00 EUR)\\n- 5m Verlegematerial (7,50 EUR)\\n- 1 x TAE Dose AP (15 EUR)");`;
code = code.replace(stateRegex, newState);

// Update init
const initRegex = /setTechnicianRemark\(order\.technicianRemark \|\| ""\);/m;
const newInit = `setTechnicianRemark(order.technicianRemark || "");
      setBdeStatus(order.bdeStatus || "BDE erledigt - neuer Bautermin erforderlich");
      setMaterialDetails(order.materialDetails || "Zeitaufwand: 1 Techniker 2,00 Std.\\nMaterialaufwand: \\n- 10m ISTY (15,00 EUR)\\n- 5m Verlegematerial (7,50 EUR)\\n- 1 x TAE Dose AP (15 EUR)");`;
code = code.replace(initRegex, newInit);

// Update saveBilling call
const callRegex = /await saveBilling\(billingOrder\.id, itemsToSave, totalAmount, apartmentLocation, technicianRemark\);/m;
const newCall = `await saveBilling(billingOrder.id, itemsToSave, totalAmount, apartmentLocation, technicianRemark, isBDE ? bdeStatus : undefined, isBDE ? materialDetails : undefined);`;
code = code.replace(callRegex, newCall);

// Add UI fields
const uiRegex = /<div>\s*<label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bemerkung \/ Mehraufwand<\/label>/m;
const newUi = `{isBDE && (
                  <>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">BDE Status (für Excel)</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm bg-white"
                        value={bdeStatus}
                        onChange={(e) => setBdeStatus(e.target.value)}
                      >
                        <option value="BDE erledigt - neuer Bautermin erforderlich">BDE erledigt - neuer Bautermin erforderlich</option>
                        <option value="BDE erledigt - TAL in Betrieb">BDE erledigt - TAL in Betrieb</option>
                        <option value="Abbruch">Abbruch</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Stunden / Material (für Excel)</label>
                      <textarea 
                        value={materialDetails}
                        onChange={e => setMaterialDetails(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm font-mono resize-none"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bemerkung / Mehraufwand</label>`;
code = code.replace(uiRegex, newUi);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Updated orders/page.tsx");
