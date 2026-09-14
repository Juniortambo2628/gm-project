"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, BookOpen, GraduationCap, Menu, X, Briefcase, Phone, LogOut, User, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconBlock } from "@/components/ui/IconBlock";
import { SafeImage } from "@/components/SafeImage";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLogoSrc } from "@/hooks/useLogoSrc";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { logoSrc, mounted } = useLogoSrc();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", path: "/", icon: Info, category: "Navigation" },
    { name: "MBA Admissions", path: "/services/mba-admissions", icon: GraduationCap, category: "Services" },
    { name: "Consulting Prep", path: "/services/consulting-interviews", icon: Briefcase, category: "Services" },
    { name: "Blog", path: "/blog", icon: BookOpen, category: "Resources" },
    { name: "Contact", path: "/contact", icon: Phone, category: "Navigation" },
  ];

  const mainLinks = [
    { name: "MBA Admissions", path: "/services/mba-admissions" },
    { name: "Consulting", path: "/services/consulting-interviews" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          isScrolled 
            ? "py-3 bg-white/70 dark:bg-card/70 backdrop-blur-3xl border-b border-border/50 shadow-2xl" 
            : "py-6 bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between px-2">
            {/* Logo */}
            <Link href="/" className="flex items-center group relative z-50 shrink-0">
                {mounted ? (
                  <div className="relative h-12 md:h-16 w-32 md:w-40 shrink-0 overflow-hidden">
                    <SafeImage
                      src={logoSrc}
                      fallback={logoSrc}
                      alt="Gathoni Mwai Logo"
                      fill
                      priority
                      sizes="(max-width: 768px) 128px, 160px"
                      className="object-contain transition-transform group-hover:scale-105 rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="h-12 md:h-16 w-32 bg-muted/10 animate-pulse rounded-xl" />
                )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-10">
              {mainLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path} 
                  className={cn(
                    "text-[13px] font-bold transition-all hover:text-primary relative group/link",
                    pathname === link.path ? "text-primary" : (isScrolled ? "text-foreground/80" : "text-foreground")
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover/link:w-full",
                    pathname === link.path && "w-full"
                  )} />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <ThemeToggle />

              {isAuthenticated ? (
                <div ref={profileRef} className="relative hidden lg:block animate-fade-in">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 h-11 px-4 rounded-xl border border-primary/30 hover:border-primary text-primary bg-secondary/50 dark:bg-transparent transition-all font-bold text-[13px]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] uppercase border border-primary/20">
                      {user?.name ? user.name.slice(0, 2) : 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name || 'Account'}</span>
                    <ChevronDown size={14} className={cn("transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        href={user?.role === 'admin' ? '/admin' : '/user'}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-2.5 transition-all"
                      >
                        <User size={14} />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={user?.role === 'admin' ? '/admin/cms' : '/user/profile'}
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center gap-2.5 transition-all"
                      >
                        <Settings size={14} />
                        <span>Edit Profile</span>
                      </Link>
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-all"
                        >
                          <LogOut size={14} />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hidden lg:block animate-fade-in">
                  <Button size="xl" variant="outline" className="h-11 px-6 font-bold text-[13px] border-primary/30 hover:border-primary text-primary bg-secondary/50 dark:bg-transparent transition-all">
                    Sign in
                  </Button>
                </Link>
              )}

              <Link href="/book" className="hidden lg:block">
                <Button size="xl" className="shadow-xl shadow-primary/20 transition-all active:scale-95 border-none h-11 px-6">
                  Book session
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                className={cn(
                  "xl:hidden p-2.5 rounded-xl transition-colors",
                  isScrolled ? "bg-secondary text-foreground" : "bg-white/10 backdrop-blur-md text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Content */}
          {isMobileMenuOpen && (
            <div className="xl:hidden mt-3 bg-card/95 backdrop-blur-2xl border border-border rounded-3xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {navItems.map((link) => (
                  <Link 
                    key={link.path} 
                    href={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${ pathname === link.path ? 'bg-primary text-white' : 'bg-muted/50 text-muted-foreground' }`}
                  >
                    <IconBlock icon={link.icon} className={cn(pathname === link.path ? "bg-white text-primary" : "", "w-8 h-8")} />
                    <span className="text-xs font-bold">{link.name}</span>
                  </Link>
                ))}
              </div>
              <div className="h-px bg-border"></div>
              
              {isAuthenticated ? (
                <>
                  <Link href={user?.role === 'admin' ? '/admin' : '/user'} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-primary/30 text-primary rounded-xl h-11 font-bold text-xs bg-secondary/50 shadow-sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={user?.role === 'admin' ? '/admin/cms' : '/user/profile'} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-border text-muted-foreground rounded-xl h-11 font-bold text-xs bg-secondary/50 shadow-sm">
                      Edit Profile
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full p-3 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 transition-all border border-destructive/20"
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary/30 text-primary rounded-xl h-11 font-bold text-xs bg-secondary/50 shadow-sm">
                    Sign in / Create Account
                  </Button>
                </Link>
              )}

              <Link href="/book" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground rounded-xl h-11 font-bold text-xs shadow-xl shadow-primary/20">
                  Book session
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
