"use client";
import { LayoutDashboard, LogOut, Settings, BarChart3, Fingerprint, RefreshCcw, MessageSquare, Globe, FileText, DollarSign, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { SiteFooter } from "@/components/SiteFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAuthLoading && user?.role !== 'admin') {
       router.push("/login");
       return;
    }
  }, [isAuthenticated, isAuthLoading, user, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isAuthLoading || (isAuthenticated && isDataLoading)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-[13px] font-medium text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  const markAsRead = async (id: number) => {
    // Legacy notification logic removed
  };

  const menuItems = [
    { name: "Analytics dashboard", path: "/admin", icon: BarChart3, category: "Overview" },
    { 
      name: "Communication", 
      category: "Interactions",
      items: [
        { name: "Client inquiries", path: "/admin/inquiries", icon: MessageSquare },
        { name: "Blog posts", path: "/admin/blog", icon: FileText },
      ]
    },
    {
      name: "Consultancy Flow",
      category: "Business",
      items: [
        { name: "Service packages", path: "/admin/services", icon: Settings },
        { name: "Bookings & Payments", path: "/admin/bookings", icon: DollarSign },
      ]
    },
    {
      name: "Site Experience",
      category: "CMS",
      items: [
        { name: "Website CMS", path: "/admin/cms", icon: Globe },
        { name: "FAQs & Proof", path: "/admin/content", icon: HelpCircle },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background font-sans transition-colors" suppressHydrationWarning>
      {/* Sidebar */}
      <aside className="w-80 bg-card flex flex-col border-r z-20">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                 <RefreshCcw size={22} strokeWidth={2.5} />
              </div>
              <div>
                 <h1 className="text-xl text-foreground leading-none">Consultancy</h1>
                 <p className="text-[13px] font-bold text-primary">Admin system</p>
              </div>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {menuItems.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {section.category}
              </p>
              <div className="space-y-1">
                {('items' in section && Array.isArray(section.items)) ? (
                  (section.items as any[]).map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link 
                        key={item.path}
                        href={item.path} 
                        className={`p-3 rounded-xl text-left font-medium flex items-center gap-3 transition-all duration-300 ${pathname === item.path ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                         <ItemIcon size={18} className={pathname === item.path ? 'text-primary-foreground' : 'text-muted-foreground'} /> 
                         <span className="text-[12px]">{item.name}</span>
                      </Link>
                    );
                  })
                ) : (
                  (() => {
                    const SectionIcon = (section as any).icon;
                    return (
                      <Link 
                        href={(section as any).path!} 
                        className={`p-3 rounded-xl text-left font-medium flex items-center gap-3 transition-all duration-300 ${pathname === (section as any).path ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                         <SectionIcon size={18} className={pathname === (section as any).path ? 'text-primary-foreground' : 'text-muted-foreground'} /> 
                         <span className="text-[12px] text-sentence-case">{(section as any).name}</span>
                      </Link>
                    );
                  })()
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 pt-0">
          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-[13px] flex items-center justify-center gap-3 transition-all"
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background transition-colors">
        <header className="h-20 flex-shrink-0 border-b flex items-center px-10 bg-card/50">
           <div>
               <h2 className="text-lg font-bold">Welcome back, {user?.name || 'Admin'}</h2>
               <p className="text-xs text-muted-foreground font-medium">Manage your consultancy platform.</p>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative">
           <div className="p-10 min-h-[calc(100vh-80px)">
              {children}
           </div>
           
           {/* Footer */}
           <SiteFooter />
        </div>
      </main>
    </div>
  );
}
