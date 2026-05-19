"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Mail, Lock, ArrowLeft, Loader2, Globe, Heart, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCMS } from "@/context/SettingContext";
import { IconBlock } from "@/components/ui/IconBlock";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const { settings } = useCMS();

  // Auth Guard: Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
         const data = await res.json();
          toast.success("Account created!", {
             description: "Welcome to the consultancy platform."
          });
         login(data.access_token, data.user);
      } else {
         toast.error("Registration failed", {
            description: "Validation error or user already exists."
         });
      }
    } catch (err) {
       toast.error("Network Error", {
          description: "Failed to connect to the registration server."
       });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return (
       <div className="h-screen w-full flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-[13px] font-medium text-muted-foreground whitespace-nowrap">Verifying session...</p>
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-background font-sans transition-colors duration-500 relative">
      {/* Floating Return Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/85 backdrop-blur-md hover:border-slate-400 dark:hover:border-slate-600 transition-all text-xs font-bold text-muted-foreground shadow-sm animate-fade-in"
      >
        <ArrowLeft size={14} /> Back to website
      </Link>
      {/* Right Side: Video & Brand */}
      <div className="relative w-full lg:w-1/2 h-[40vh] lg:h-screen bg-slate-900 overflow-hidden group">
         <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[10000ms] group-hover:scale-110"
         >
            <source src="/register-video.mp4" type="video/mp4" />
         </video>
         
         {/* Overlay Content */}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40 p-12 flex flex-col justify-between">
            <div className="flex items-center gap-3">
               <img 
                 src={settings['logo_light'] || "/branding/GM-logo-light-final.png"} 
                 alt="Logo" 
                 className="h-10 w-auto object-contain rounded-xl"
                 onError={(e) => {
                   const target = e.currentTarget;
                   const fallback = "/branding/GM-logo-light-final.png";
                   if (target.src !== window.location.origin + fallback && target.src !== fallback) {
                     target.src = fallback;
                   }
                 }}
               />
            </div>

            <div className="max-w-md hidden lg:block text-right self-end">
               <h2 className="text-4xl font-bold text-white leading-tight mb-4">Empower your <span className="text-primary bg-white px-2 rounded-lg italic text-lg">voice</span> within the workplace</h2>
               <p className="text-slate-300 font-medium leading-relaxed">
                  Join a community dedicated to excellence and personal growth. Your journey starts here.
               </p>
            </div>
         </div>
      </div>

      {/* Left Side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-background relative transition-colors duration-300">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         <div className="w-full max-w-md relative z-10">
            <div className="mb-10 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-primary rounded-full text-[13px] font-bold mb-4 border border-border">
                  Welcome aboard
               </div>
               <h3 className="text-4xl text-foreground mb-2 italic">Register</h3>
               <p className="text-muted-foreground font-bold text-sm">Fill in the details below to begin your journey.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
               <div className="space-y-2 group">
                  <label className="text-[13px] font-bold text-muted-foreground ml-1">Full name</label>
                  <div className="relative">
                     <CheckCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                     <Input 
                        type="text" 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                        className="h-14 pl-12 bg-card border-border rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/30 text-foreground"
                     />
                  </div>
               </div>

               <div className="space-y-2 group">
                  <label className="text-[13px] font-bold text-muted-foreground ml-1">Email address</label>
                  <div className="relative">
                     <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                     <Input 
                        type="email" 
                        placeholder="john@company.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        className="h-14 pl-12 bg-card border-border rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/30 text-foreground"
                     />
                  </div>
               </div>

               <div className="space-y-2 group">
                  <label className="text-[13px] font-bold text-muted-foreground ml-1">Password</label>
                  <div className="relative">
                     <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                     <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        className="h-14 pl-12 bg-card border-border rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-muted-foreground/30 text-foreground"
                     />
                  </div>
               </div>

               <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-teal-900/20 text-xs transition-all active:scale-[0.98]"
               >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Authorize and join platform"
                  )}
               </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-border flex flex-col items-center gap-4">
               <div className="flex gap-3">
                  <Link 
                     href="/" 
                     className="px-6 py-3 rounded-xl border border-border hover:border-slate-400 dark:hover:border-slate-600 transition-all text-[13px] font-bold text-muted-foreground bg-card"
                  >
                     Return home
                  </Link>
                  <Link 
                     href="/login" 
                     className="px-6 py-3 rounded-xl border border-primary/20 hover:border-primary text-primary transition-all text-[13px] font-bold bg-secondary flex items-center gap-2 group"
                  >
                     <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                     Sign in
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
