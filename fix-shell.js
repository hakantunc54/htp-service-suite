const fs = require('fs');
let code = fs.readFileSync('src/components/ClientShell.tsx', 'utf8');

// Add signOut import
code = code.replace(
  'import { usePathname, useRouter } from "next/navigation";',
  'import { usePathname, useRouter } from "next/navigation";\nimport { signOut } from "next-auth/react";'
);

// Add logout dropdown state and functionality
code = code.replace(
  'const [isSidebarOpen, setIsSidebarOpen] = useState(false);',
  'const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);'
);

// Replace User Menu
const userMenu = `
            <div className="flex items-center gap-3 lg:gap-5">
              <button className="p-2 text-gray-400 hover:text-slate-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span> */}
              </button>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    A
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block pr-2">Admin</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <button 
                      onClick={() => { setIsUserMenuOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            </div>
`;

code = code.replace(
  /<div className="flex items-center gap-3 lg:gap-5">[\s\S]*?<\/div>\s*<\/header>/,
  userMenu + '\n          </header>'
);

// Hide on login page
code = code.replace(
  'return (',
  'if (pathname === "/login") return <>{children}</>;\n\n  return ('
);

fs.writeFileSync('src/components/ClientShell.tsx', code, 'utf8');
