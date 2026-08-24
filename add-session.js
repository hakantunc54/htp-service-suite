const fs = require('fs');

let code = fs.readFileSync('src/components/ClientShell.tsx', 'utf8');

code = code.replace(
  'import { signOut } from "next-auth/react";',
  'import { signOut, SessionProvider, useSession } from "next-auth/react";'
);

// We need an inner component to use useSession
const innerComponent = `
function ShellContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(\`/orders?q=\${encodeURIComponent(searchQuery.trim())}\`);
      setSearchQuery("");
    }
  };

  if (pathname === "/login") return <>{children}</>;

  const userName = session?.user?.name || "Admin";
  const userInitials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
`;

code = code.replace(
  /export default function ClientShell[\s\S]*?if \(pathname === "\/login"\) return <>{children}<\/>;/,
  innerComponent
);

code = code.replace(
  '<span className="text-sm font-medium text-slate-700 hidden sm:block pr-2">Admin</span>',
  '<span className="text-sm font-medium text-slate-700 hidden sm:block pr-2">{userName}</span>'
);

code = code.replace(
  '<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">\n                    A\n                  </div>',
  '<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">\n                    {userInitials}\n                  </div>'
);

code += `

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ShellContent>{children}</ShellContent>
    </SessionProvider>
  );
}
`;

fs.writeFileSync('src/components/ClientShell.tsx', code, 'utf8');
