const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const target = '{order.isBilled ? (\n                          <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> BERECHNET</span>\n                        ) : (';

const replace = '{order.isBilled ? (\n                          <button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>\n                        ) : (';

const target2 = '{order.isBilled ? (\r\n                          <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 \r\nclassName="w-4 h-4" /> BERECHNET</span>\r\n                        ) : (';

const replace2 = '{order.isBilled ? (\r\n                          <button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>\r\n                        ) : (';


// Let's use a smarter replace
code = code.replace(/<span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" \/> BERECHNET<\/span>/, 
'<button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 hover:bg-green-50 p-1.5 rounded transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>'
);

// If the above regex doesn't match because of line breaks:
const parts = code.split('BERECHNET</span>');
if (parts.length > 1) {
    const before = parts[0].replace(/<span className="text-green-600 font-bold flex items-center gap-1"[^>]*><CheckCircle2 [^>]*>\s*$/, '');
    code = before + '<button onClick={() => openBilling(order)} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-colors cursor-pointer" title="Abrechnung bearbeiten"><CheckCircle2 className="w-4 h-4" /> BERECHNET</button>' + parts[1];
}

fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
console.log("Fixed BERECHNET button");
