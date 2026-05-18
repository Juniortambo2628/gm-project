"use client";
import { LayoutDashboard, LogOut, Settings, BarChart3, Fingerprint, RefreshCcw, MessageSquare, Globe, FileText, DollarSign, HelpCircle, Bell, CheckCheck, User, ShieldAlert, Clock, ExternalLink, Lock, Check, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { SiteFooter } from "@/components/SiteFooter";
import { useCMS } from "@/context/SettingContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { settings, getSetting } = useCMS();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/cms/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notif-dropdown-container')) {
        setIsNotifOpen(false);
      }
      if (!target.closest('.profile-dropdown-container')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const markSingleAsRead = async (id: number) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await axiosInstance.post(`/cms/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await axiosInstance.post('/cms/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTheme = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
      };
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

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
              {(() => {
                const logoLight = getSetting('logo_light') || "/branding/GM-logo-light-final.png";
                const logoDark = getSetting('logo_dark') || "/branding/GM-logo-dark-final.png";
                const logoSrc = isDark ? logoLight : logoDark;
                
                return (
                  <div className="flex items-center gap-3">
                    <img 
                      src={logoSrc} 
                      alt="Site Logo" 
                      className="h-10 w-auto object-contain transition-transform group-hover:scale-105" 
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = isDark ? "/branding/GM-logo-light-final.png" : "/branding/GM-logo-dark-final.png";
                        if (target.src !== window.location.origin + fallback && target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div>
                       <h1 className="text-[13px] font-black text-foreground tracking-wider leading-none uppercase">{settings['site_name'] || "Consultancy"}</h1>
                       <p className="text-[10px] font-bold text-primary tracking-wide uppercase mt-1">Admin system</p>
                    </div>
                  </div>
                );
              })()}
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
        <header className="h-20 flex-shrink-0 border-b flex items-center justify-between px-10 bg-card/50 z-30 relative">
           <div>
               <h2 className="text-lg font-bold">Welcome back, {user?.name || 'Admin'}</h2>
               <p className="text-xs text-muted-foreground font-medium">Manage your consultancy platform.</p>
           </div>

           {/* Actions bar */}
           <div className="flex items-center gap-5">
              {/* Notification Dropdown Container */}
              <div className="relative notif-dropdown-container">
                 <Button
                   variant="ghost"
                   size="icon"
                   className={`w-10 h-10 rounded-xl relative transition-all ${isNotifOpen ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                   onClick={() => setIsNotifOpen(!isNotifOpen)}
                 >
                    <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-destructive-foreground shadow-md shadow-destructive/20 border-2 border-background animate-pulse">
                         {unreadCount}
                      </span>
                    )}
                 </Button>

                 {isNotifOpen && (
                   <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl p-5 space-y-4 z-50 text-foreground animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center justify-between pb-3 border-b border-muted">
                         <div className="flex items-center gap-2">
                            <span className="font-black text-sm uppercase tracking-wider">Alerts & Logs</span>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                                 {unreadCount} new
                              </span>
                            )}
                         </div>
                         {unreadCount > 0 && (
                           <button 
                             onClick={markAllAsRead}
                             className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors uppercase tracking-wider"
                           >
                              <CheckCheck size={12} /> Mark read
                           </button>
                         )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                         {notifications.length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                              <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center">
                                 <Bell size={18} className="text-muted-foreground/60" />
                              </div>
                              <p className="text-xs font-semibold">All caught up!</p>
                              <p className="text-[10px] text-muted-foreground/60">No notification logs recorded.</p>
                           </div>
                         ) : (
                           notifications.map((notif) => {
                              const isUnread = !notif.is_read;
                              return (
                                <div 
                                  key={notif.id}
                                  onClick={() => markSingleAsRead(notif.id)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 text-left ${isUnread ? 'bg-primary/5 hover:bg-primary/10 border-primary/20' : 'bg-muted/10 hover:bg-muted/30 border-muted-foreground/10'}`}
                                >
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                     notif.type === 'booking' ? 'bg-emerald-500/10 text-emerald-500' :
                                     notif.type === 'inquiry' ? 'bg-indigo-500/10 text-indigo-500' :
                                     'bg-blue-500/10 text-blue-500'
                                   }`}>
                                      {notif.type === 'booking' ? <DollarSign size={15} /> :
                                       notif.type === 'inquiry' ? <MessageSquare size={15} /> :
                                       <ShieldAlert size={15} />}
                                   </div>
                                   <div className="flex-1 min-w-0 space-y-1">
                                      <div className="flex items-start justify-between gap-2">
                                         <p className={`text-xs truncate ${isUnread ? 'font-black text-foreground' : 'font-semibold text-muted-foreground'}`}>{notif.title}</p>
                                         <span className="text-[8px] text-muted-foreground/60 font-semibold uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                                            <Clock size={10} /> {new Date(notif.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                                         </span>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed break-words">{notif.message}</p>
                                   </div>
                                   {isUnread && (
                                     <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0 animate-pulse" />
                                   )}
                                </div>
                              );
                           })
                         )}
                      </div>
                   </div>
                 )}
              </div>

              {/* Profile Dropdown Container */}
              <div className="relative profile-dropdown-container">
                 <button 
                   onClick={() => setIsProfileOpen(!isProfileOpen)}
                   className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-white/10 group text-left"
                 >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm uppercase border border-primary/20 transition-transform group-hover:scale-105 shadow-sm">
                       {user?.name ? user.name.slice(0, 2) : 'AD'}
                    </div>
                    <div className="hidden md:block pr-2">
                       <p className="text-xs font-bold text-foreground leading-none">{user?.name || 'Administrator'}</p>
                       <p className="text-[9px] font-bold text-primary uppercase tracking-wider mt-1">{user?.role || 'Staff'}</p>
                    </div>
                 </button>

                 {isProfileOpen && (
                   <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl p-5 space-y-4 z-50 text-foreground animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-center gap-3 pb-3 border-b border-muted">
                         <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg uppercase border border-primary/20">
                            {user?.name ? user.name.slice(0, 2) : 'AD'}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-xs font-black truncate">{user?.name || 'Administrator'}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'admin@gathonimwai.com'}</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                               Active Session
                            </span>
                         </div>
                      </div>

                      <div className="space-y-1">
                         <Link 
                           href="/admin/cms" 
                           onClick={() => setIsProfileOpen(false)}
                           className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-3 transition-all"
                         >
                            <Settings size={14} className="text-muted-foreground/60" />
                            <span>System Settings</span>
                         </Link>
                         <Link 
                           href="/" 
                           target="_blank"
                           onClick={() => setIsProfileOpen(false)}
                           className="w-full p-2.5 rounded-xl text-left text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-3 transition-all"
                         >
                            <ExternalLink size={14} className="text-muted-foreground/60" />
                            <span>View Storefront</span>
                         </Link>
                      </div>

                      <div className="pt-3 border-t border-muted">
                         <Button 
                           onClick={() => {
                             setIsProfileOpen(false);
                             handleLogout();
                           }}
                           variant="ghost"
                           className="w-full h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-destructive/10"
                         >
                            <LogOut size={14} /> Log out
                         </Button>
                      </div>
                   </div>
                 )}
              </div>
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
