const fs = require('fs');

let code = fs.readFileSync('src/components/ClientShell.tsx', 'utf8');

const correctNavItems = `
const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Smart Import", href: "/import", icon: Inbox },
  { name: "Terminabsprachen", href: "/terminabsprachen", icon: Calendar, highlight: true },
  { name: "Disposition", href: "/planning", icon: Calendar },
  { name: "Kunden & Aufträge", href: "/orders", icon: Users },
  { name: "Abrechnung", href: "/billing", icon: Calculator },
];
`;

code = code.replace(/const navItems = \[[\s\S]*?\];/m, correctNavItems.trim());
fs.writeFileSync('src/components/ClientShell.tsx', code, 'utf8');
