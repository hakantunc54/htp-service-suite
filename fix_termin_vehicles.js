const fs = require('fs');
let code = fs.readFileSync('src/app/terminabsprachen/page.tsx', 'utf8');

// The vehicles array is currently hardcoded:
// const vehicles = [Vehicle.AUTO_1, Vehicle.AUTO_2, Vehicle.AUTO_3];

// Let's replace it with a dynamic one inside the render, or just a getter.
// We can change the mapping inside the UI where `vehicles.map` is used.

const oldSelect = `<select 
                            value={vehicle}
                            onChange={e => setVehicle(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                          >
                            <option value="none">Kein Fahrzeug / Pool</option>
                            {vehicles.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>`;

const newSelect = `<select 
                            value={vehicle}
                            onChange={e => setVehicle(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                          >
                            <option value="none">Kein Fahrzeug / Pool</option>
                            {(order.orderType && order.orderType.includes('BdE') ? ['T1', 'T2', 'T3', 'T4'] : ['Auto 1', 'Auto 2', 'Auto 3']).map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/app/terminabsprachen/page.tsx', code, 'utf8');
