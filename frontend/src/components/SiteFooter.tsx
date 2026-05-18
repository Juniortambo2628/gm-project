"use client";

import Link from "next/link";
import { Globe, Cpu, ShieldCheck, Database, Zap, Share2, MessageSquare, Users, Smartphone } from "lucide-react";
import { useSetting } from "@/context/SettingContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { IconBlock } from "@/components/ui/IconBlock";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const { getSetting } = useSetting();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { settings } = useSetting();
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const logoSrc = currentTheme === 'dark' 
    ? (settings['logo_dark'] || "/branding/GM-logo-dark-final.png") 
    : (settings['logo_light'] || "/branding/GM-logo-light-final.png");

  return (
    <footer className="relative bg-background border-t border-border transition-colors duration-300 pt-20 pb-10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group mb-4">
                 {mounted ? (
                   <img 
                     src={logoSrc} 
                     alt="Gathoni Mwai Logo" 
                     className="h-16 md:h-20 w-auto object-contain transition-all rounded-xl"
                     onError={(e) => {
                       const target = e.currentTarget;
                       const fallback = currentTheme === 'dark' ? "/branding/GM-logo-dark-final.png" : "/branding/GM-logo-light-final.png";
                       if (target.src !== window.location.origin + fallback && target.src !== fallback) {
                         target.src = fallback;
                       }
                     }}
                   />
                 ) : (
                   <div className="h-16 md:h-20 w-40 bg-muted/10 animate-pulse rounded-xl" />
                 )}
            </Link>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-xs">
              Empowering African talent to access global MBA opportunities and elite consulting careers. 
              Authentic guidance from Nairobi to Oxford and beyond.
            </p>
            <div className="flex gap-4">
              {[Share2, MessageSquare, Users, Smartphone].map((Icon, i) => (
                <IconBlock key={i} icon={Icon} className="rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[13px] font-bold text-primary mb-8">Navigation</h4>
            <ul className="space-y-4">
              {[
                { name: "MBA Admissions", path: "/services/mba-admissions" },
                { name: "Consulting Prep", path: "/services/consulting-interviews" },
                { name: "Testimonials", path: "/testimonials" },
                { name: "African Advantage", path: "/africa" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-bold text-primary mb-8">Connect</h4>
            <ul className="space-y-4">
              {[
                { name: "Book a Session", path: "/book" },
                { name: "Contact", path: "/contact" },
                { name: "Blog / Insights", path: "/blog" },
                { name: "LinkedIn", path: "https://linkedin.com/in/gathonimwai" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.path} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 dark:bg-card/40 backdrop-blur-sm p-8 rounded-[40px] border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <MessageSquare size={100} />
            </div>
            <h4 className="text-[13px] font-bold text-primary mb-6">Direct inquiry</h4>
            
            <div className="space-y-6 relative z-10">
               <div className="flex items-center gap-4">
                  <IconBlock icon={Zap} />
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none mb-1">Response time</p>
                    <p className="text-[13px] font-bold text-primary">Within 24 hours</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <IconBlock icon={ShieldCheck} />
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none mb-1">Premium support</p>
                    <p className="text-[13px] font-bold text-muted-foreground">Certified coach</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-6">
              <p className="text-[11px] font-bold text-muted-foreground">
                &copy; {currentYear} Gathoni Mwai. All rights reserved.
              </p>
           </div>
           
           <div className="flex items-center gap-8">
              {["Privacy", "Terms", "Legal", "Cookies"].map((legal) => (
                <Link key={legal} href={`/legal/${legal.toLowerCase()}`} className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors">
                  {legal}
                </Link>
              ))}
           </div>

           <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-[11px] font-bold text-muted-foreground">Premium Profile v3.0</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
