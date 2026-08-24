const fs = require('fs');
let code = fs.readFileSync('src/app/orders/[id]/page.tsx', 'utf8');

// I will add a small inline edit for the port, or just an edit button.
// Currently it's:
// <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono">Port: {order.port}</span>

const oldCode = `<span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono">Port: {order.port}</span>`;
const newCode = `
<span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono group relative">
  Port: {order.port || "Fehlt"}
  <button 
    onClick={async () => {
      const newPort = window.prompt("Bitte Port eingeben:", order.port || "");
      if (newPort !== null) {
        await fetch(\`/api/orders/\${order.id}/port\`, { method: 'POST', body: JSON.stringify({ port: newPort }) });
        window.location.reload();
      }
    }}
    className="ml-2 text-purple-400 hover:text-purple-900 underline text-xs"
  >
    Bearbeiten
  </button>
</span>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/app/orders/[id]/page.tsx', code, 'utf8');
