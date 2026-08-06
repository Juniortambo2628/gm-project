"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, BookOpen, GraduationCap, Menu, X, Briefcase, Phone } from "lucide-react";
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
  const { user, isAuthenticated } = useAuth();
  const { logoSrc, mounted } = useLogoSrc();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
                      fallback={currentTheme === 'dark' ? "/branding/GM-logo-dark-final.png" : "/branding/GM-logo-light-final.png"}
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
                <Link href={user?.role === 'admin' ? '/admin' : '/user'} className="hidden lg:block animate-fade-in">
                  <Button size="xl" variant="outline" className="h-11 px-6 font-bold text-[13px] border-primary/30 hover:border-primary text-primary bg-secondary/50 dark:bg-transparent transition-all">
                    Dashboard
                  </Button>
                </Link>
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
                <Link href={user?.role === 'admin' ? '/admin' : '/user'} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-primary/30 text-primary rounded-xl h-11 font-bold text-xs bg-secondary/50 shadow-sm">
                    Dashboard
                  </Button>
                </Link>
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
