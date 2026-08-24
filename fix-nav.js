const fs = require('fs');

let code = fs.readFileSync('src/components/ClientShell.tsx', 'utf8');

const navItems = `
const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Smart Import", href: "/import", icon: Inbox },
  { name: "Terminabsprachen", href: "/orders", icon: Calendar, highlight: true },
  { name: "Disposition", href: "/disposition", icon: Users },
  { name: "Kunden & Aufträge", href: "/customers", icon: UserCircle },
  { name: "Abrechnung", href: "/billing", icon: Calculator },
];
`;

code = code.replace(
  'function ShellContent({ children }: { children: React.ReactNode }) {',
  navItems + '\nfunction ShellContent({ children }: { children: React.ReactNode }) {'
);

fs.writeFileSync('src/components/ClientShell.tsx', code, 'utf8');
