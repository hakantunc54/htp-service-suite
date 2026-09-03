const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

// Replace state
code = code.replace(/const \[optionalValue, setOptionalValue\] = useState<number>\(0\);/, 'const [variableValues, setVariableValues] = useState<Record<string, number>>({});');

code = code.replace(/setOptionalValue\(0\);/, 'setVariableValues({});');

// calculateTotal
code = code.replace(/if \(item\.name\.toLowerCase\(\)\.includes\("optional"\) \|\| item\.name\.toLowerCase\(\)\.includes\("material"\)\) \{\s*total \+= optionalValue;\s*\}/, `if (item.name.toLowerCase().includes("optional") || item.name.toLowerCase().includes("material")) {
          total += (variableValues[item.id] || 0);
        }`);

// handleSaveBilling
code = code.replace(/if \(isVariable && optionalValue > 0\) \{\s*itemsToSave\.push\(\{ serviceItemId: item\.id, quantity: 1, amount: optionalValue \}\);\s*\}/, `if (isVariable && (variableValues[item.id] || 0) > 0) {
          itemsToSave.push({ serviceItemId: item.id, quantity: 1, amount: variableValues[item.id] });
        }`);

// rendering
code = code.replace(/const rowTotal = isVariable \? optionalValue : \(item\.defaultPrice \|\| 0\) \* q;/, 'const rowTotal = isVariable ? (variableValues[item.id] || 0) : (item.defaultPrice || 0) * q;');

code = code.replace(/value=\{optionalValue \|\| ""\}\n\s*placeholder="0,00"\n\s*onChange=\{e => setOptionalValue\(parseFloat\(e\.target\.value\) \|\| 0\)\}/, `value={variableValues[item.id] || ""}
                              placeholder="0,00"
                              onChange={e => setVariableValues({...variableValues, [item.id]: parseFloat(e.target.value) || 0})}`);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed variableValues mapping");
