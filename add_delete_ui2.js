const fs = require('fs');
let code = fs.readFileSync('src/app/orders/page.tsx', 'utf8');

const regex = /<td className="px-6 py-4 text-right">[\s\S]*?<Link\s*href=\{\`\/orders\/\$\{order\.id\}\`\}[\s\S]*?className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"[\s\S]*?>[\s\S]*?Akte <ChevronRight className="w-4 h-4" \/>[\s\S]*?<\/Link>\s*<\/td>/;

const replaceUI = `<td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={\`/orders/\${order.id}\`}
                            className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-blue-800"
                          >
                            Akte <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id, order.customer.customerName); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Auftrag l\u00f6schen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>`;

if (regex.test(code)) {
    code = code.replace(regex, replaceUI);
    fs.writeFileSync('src/app/orders/page.tsx', code, 'utf8');
    console.log("Added delete UI with regex");
} else {
    console.log("UI regex failed again");
}
