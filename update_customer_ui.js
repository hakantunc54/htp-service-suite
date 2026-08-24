const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

const oldAddressBlock = `<div className="bg-slate-50 p-4 rounded-xl mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anschlussadresse</h3>
            <p className="text-slate-800">{order.customer.address}</p>
          </div>`;

const newAddressBlock = `<div className="bg-slate-50 p-4 rounded-xl mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anschlussadresse</h3>
              <p className="text-slate-800">{order.customer.address}</p>
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-semibold">Telefon:</span> {order.customer.phone || 'Keine'}
              </div>
            </div>
            <button 
              onClick={async () => {
                const newAddress = window.prompt("Neue Adresse:", order.customer.address || "");
                if (newAddress !== null) {
                  const newPhone = window.prompt("Neue Telefonnummer:", order.customer.phone || "");
                  if (newPhone !== null) {
                    await fetch(\`/api/customer/\${order.customer.id}\`, { 
                      method: 'POST', 
                      body: JSON.stringify({ address: newAddress, phone: newPhone, orderId: order.id }) 
                    });
                    window.location.reload();
                  }
                }
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Bearbeiten
            </button>
          </div>`;

code = code.replace(oldAddressBlock, newAddressBlock);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
