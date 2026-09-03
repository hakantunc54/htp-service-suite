const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const startIdx = code.indexOf('<thead');
const endIdx = code.indexOf('</thead>', startIdx) + 8;

const newThead = `<thead className="bg-gray-100 text-gray-600 font-semibold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th onClick={() => handleSort("Kunde")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Kunde {renderSortIndicator("Kunde")}
                  </th>
                  <th onClick={() => handleSort("Adresse")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Adresse {renderSortIndicator("Adresse")}
                  </th>
                  <th onClick={() => handleSort("Auftragstyp")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Auftragstyp {renderSortIndicator("Auftragstyp")}
                  </th>
                  <th onClick={() => handleSort("Datum")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Datum {renderSortIndicator("Datum")}
                  </th>
                  <th onClick={() => handleSort("Status")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Status {renderSortIndicator("Status")}
                  </th>
                  <th onClick={() => handleSort("Abrechnung")} className="px-6 py-4 cursor-pointer hover:bg-gray-200 transition-colors">
                    Abrechnung {renderSortIndicator("Abrechnung")}
                  </th>
                  <th className="px-6 py-4 text-right">Aktionen</th>
                </tr>
              </thead>`;

code = code.substring(0, startIdx) + newThead + code.substring(endIdx);
fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed table head");
