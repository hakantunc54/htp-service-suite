const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

code = code.replace(
  /<input\s+type="text"\s+value=\{technicianRemark\}\s+onChange=\{e => setTechnicianRemark\(e\.target\.value\)\}\s+placeholder="z\.B\. Kabelkanal 5m gezogen"\s+className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 \nfocus:border-blue-500 outline-none text-sm"\s+\/>/g,
  `<textarea
                      value={technicianRemark}
                      onChange={e => setTechnicianRemark(e.target.value)}
                      placeholder="z.B. Kabelkanal 5m gezogen"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                    />`
);

// Actually, this regex might break again due to newlines. Let's just use a more permissive regex.
code = code.replace(
  /<input[\s\S]*?value=\{technicianRemark\}[\s\S]*?onChange=\{e => setTechnicianRemark\(e\.target\.value\)\}[\s\S]*?placeholder="z\.B\. Kabelkanal 5m gezogen"[\s\S]*?\/>/,
  `<textarea
                      value={technicianRemark}
                      onChange={e => setTechnicianRemark(e.target.value)}
                      placeholder="z.B. Kabelkanal 5m gezogen"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                    />`
);

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
