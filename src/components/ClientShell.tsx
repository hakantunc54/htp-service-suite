"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Inbox, Calendar, Users, Calculator, Settings, Menu, Search, X, Bell, UserCircle } from "lucide-react";
import { Toaster } from "sonner";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/orders?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Smart Import", href: "/import", icon: Inbox },
    { name: "Terminabsprachen", href: "/terminabsprachen", icon: Calendar, highlight: true },
    { name: "Disposition", href: "/planning", icon: Calendar },
    { name: "Kunden & Aufträge", href: "/orders", icon: Users },
    { name: "Abrechnung", href: "/billing", icon: Calculator },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <Toaster position="bottom-right" richColors />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-300 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-white tracking-tight flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">H</div>
            <span className="text-blue-500">HTP</span> Suite
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 px-3">Hauptmenü</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                    : item.highlight 
                      ? "text-amber-500 hover:bg-slate-900 hover:text-amber-400"
                      : "hover:bg-slate-900 hover:text-white text-slate-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "opacity-100" : "opacity-75"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800/50 m-4 rounded-2xl bg-slate-900">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:text-white text-slate-400 transition-colors">
            <Settings className="w-5 h-5 opacity-75" />
            <span className="font-medium text-sm">Einstellungen</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Global Search */}
            <form onSubmit={handleSearch} className="hidden md:flex relative group w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kunden, Adressen oder Aufträge suchen..." 
                className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            <button className="p-2 text-gray-400 hover:text-slate-700 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                HT
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block pr-2">Hakan Tunç</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}
