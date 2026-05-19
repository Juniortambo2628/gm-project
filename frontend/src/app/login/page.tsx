"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCMS } from "@/context/SettingContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [emailMasked, setEmailMasked] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState("");

  // Forgot Password flow state
  const [flow, setFlow] = useState<'login' | 'forgot' | 'reset-code' | 'new-password'>('login');
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [simulatedResetCode, setSimulatedResetCode] = useState("");

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedResetCode(simulatedCode);
      toast.success("Security code generated", {
        description: `A dynamic verification code has been dispatched to ${forgotEmail}.`
      });
      setFlow('reset-code');
    } catch (err) {
      toast.error("Error", { description: "Failed to request password reset." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (resetCode === simulatedResetCode) {
      toast.success("Code verified successfully!", {
        description: "Please configure your new security credentials."
      });
      setFlow('new-password');
    } else {
      toast.error("Verification Failed", {
        description: "Invalid or expired security reset code."
      });
    }
    setLoading(false);
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmNewPassword) {
      toast.error("Validation Error", {
        description: "Passwords do not match."
      });
      setLoading(false);
      return;
    }
    
    toast.success("Security credentials updated", {
      description: "You may now sign in using your new password."
    });
    setEmail(forgotEmail);
    setFlow('login');
    setLoading(false);
  };

  const router = useRouter();
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const { settings } = useCMS();

  // Auth Guard: Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
         const data = await res.json();
         if (data.requires_2fa) {
            setRequires2FA(true);
            setEmailMasked(data.email_masked);
            setTempToken(data.temp_token);
            setDebugCode(data.debug_code || "");
            toast.success("Verification required", {
               description: `A dynamic security code has been sent to ${data.email_masked}`
            });
         } else {
            toast.success("Welcome back!", {
               description: `Successfully signed in as ${data.user.name}`
            });
            login(data.access_token, data.user);
         }
      } else {
         toast.error("Authentication Failed", {
            description: "Check your email and password and try again."
         });
      }
    } catch (err) {
       toast.error("Connection Error", {
          description: "Unable to reach the authentication server."
       });
    } finally {
       setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const res = await fetch(`${apiUrl}/login/verify-2fa`, {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
               "Accept": "application/json"
           },
           body: JSON.stringify({ temp_token: tempToken, code })
        });
        if (res.ok) {
           const data = await res.json();
           toast.success("Identity Verified!", {
              description: `Successfully signed in as ${data.user.name}`
           });
           login(data.access_token, data.user);
        } else {
           const data = await res.json();
           toast.error("Verification Failed", {
              description: data.message || "Invalid or expired security code."
           });
        }
     } catch (err) {
        toast.error("Connection Error", {
           description: "Unable to reach the verification server."
        });
     } finally {
        setLoading(false);
     }
  };

  if (isLoading || isAuthenticated) {
    return (
       <div className="h-screen w-full flex items-center justify-center bg-background">
           <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-[13px] font-medium text-slate-500 whitespace-nowrap">Logged in? Let's get you set up.</p>
           </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans transition-all duration-500 relative">
      {/* Floating Return Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/85 backdrop-blur-md hover:border-slate-400 dark:hover:border-slate-600 transition-all text-xs font-bold text-muted-foreground shadow-sm animate-fade-in"
      >
        <ArrowLeft size={14} /> Back to website
      </Link>
      {/* Left Side: Brand Section */}
      <div className="relative w-full lg:w-1/2 h-[35vh] lg:h-screen bg-slate-900 overflow-hidden group">
         <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[10000ms] group-hover:scale-110"
         >
            <source src="/login-video.mp4" type="video/mp4" />
         </video>
         
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40 p-10 flex flex-col justify-between">
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
 
              <div className="max-w-md hidden lg:block pb-12">
                 <h2 className="text-3xl font-bold text-white leading-tight mb-4">Helping Africans access the world's <span className="text-primary bg-white px-2 py-0.5 rounded-lg">best</span> opportunities</h2>
                 <p className="text-slate-300 font-medium leading-relaxed text-sm">
                    Join talented professionals leveraging authentic stories to win global admissions and career breakthroughs.
                 </p>
              </div>
          </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20 bg-background relative transition-colors duration-300">
         <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         
         <div className="w-full max-w-sm relative z-10">
            {requires2FA ? (
               <>
                  <div className="mb-8 text-center lg:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[13px] font-bold mb-4 border border-emerald-500/20">
                        <ShieldCheck size={12} /> Identity Verification
                     </div>
                     <h3 className="text-3xl font-bold text-foreground mb-2">Enter code</h3>
                     <p className="text-slate-500 font-bold text-sm">
                        We've sent a 6-digit confirmation code to <span className="text-primary font-black">{emailMasked}</span>. Enter it below, or use one of your recovery backup codes.
                     </p>
                  </div>

                  <form onSubmit={handleVerify2FA} className="space-y-5">
                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">Verification Code</label>
                         <div className="relative">
                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                            <Input 
                               type="text" 
                               placeholder="123-456 or Backup Code" 
                               value={code}
                               onChange={(e) => setCode(e.target.value)}
                               required 
                               className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold tracking-widest text-foreground text-center text-lg placeholder:text-slate-400/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                            />
                         </div>
                      </div>

                      {debugCode && (
                         <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center space-y-1 animate-pulse">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Simulated Verification Code</p>
                            <code className="text-lg font-mono font-black text-foreground">{debugCode}</code>
                         </div>
                      )}

                      <Button 
                         type="submit" 
                         disabled={loading} 
                         className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] group shadow-lg shadow-primary/10"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                           <div className="flex items-center justify-center gap-2">
                             Verify and Proceed
                             <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                           </div>
                        )}
                     </Button>

                     <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                           setRequires2FA(false);
                           setCode("");
                           setDebugCode("");
                        }}
                        className="w-full h-10 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted"
                     >
                        Back to Login
                     </Button>
                  </form>
               </>
            ) : flow === 'forgot' ? (
               <>
                  <div className="mb-8 text-center lg:text-left">
                     <h3 className="text-3xl font-bold text-foreground mb-2">Reset password</h3>
                     <p className="text-slate-500 font-bold text-sm">Enter your email address and we'll dispatch a password reset code.</p>
                  </div>

                  <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">Email address</label>
                        <div className="relative">
                           <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                           <Input 
                              type="email" 
                              placeholder="admin@culturemonitor.com" 
                              value={forgotEmail}
                              onChange={(e) => setForgotEmail(e.target.value)}
                              required 
                              className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400/30 text-foreground"
                           />
                        </div>
                     </div>

                     <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] group shadow-lg shadow-primary/10"
                     >
                       {loading ? (
                         <Loader2 className="animate-spin" size={18} />
                       ) : (
                          <div className="flex items-center justify-center gap-2">
                            Request reset code
                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                       )}
                    </Button>

                     <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setFlow("login")}
                        className="w-full h-10 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted"
                     >
                        Back to Login
                     </Button>
                  </form>
               </>
            ) : flow === 'reset-code' ? (
               <>
                  <div className="mb-8 text-center lg:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[13px] font-bold mb-4 border border-emerald-500/20">
                        <ShieldCheck size={12} /> Security Check
                     </div>
                     <h3 className="text-3xl font-bold text-foreground mb-2">Enter reset code</h3>
                     <p className="text-slate-500 font-bold text-sm">
                        A security reset code has been sent to <span className="text-primary font-black">{forgotEmail}</span>.
                     </p>
                  </div>

                  <form onSubmit={handleVerifyResetCode} className="space-y-5">
                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">Reset Code</label>
                         <div className="relative">
                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                            <Input 
                               type="text" 
                               placeholder="Enter 6-digit Code" 
                               value={resetCode}
                               onChange={(e) => setResetCode(e.target.value)}
                               required 
                               className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold tracking-widest text-foreground text-center text-lg placeholder:text-slate-400/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                            />
                         </div>
                      </div>

                      {simulatedResetCode && (
                         <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center space-y-1 animate-pulse">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Simulated Password Reset Code</p>
                            <code className="text-lg font-mono font-black text-foreground">{simulatedResetCode}</code>
                         </div>
                      )}

                      <Button 
                         type="submit" 
                         disabled={loading} 
                         className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] group shadow-lg shadow-primary/10"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                           <div className="flex items-center justify-center gap-2">
                             Verify and Proceed
                             <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                           </div>
                        )}
                     </Button>

                     <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setFlow("forgot")}
                        className="w-full h-10 rounded-xl font-bold text-xs text-muted-foreground hover:bg-muted"
                     >
                        Request another code
                     </Button>
                  </form>
               </>
            ) : flow === 'new-password' ? (
               <>
                  <div className="mb-8 text-center lg:text-left">
                     <h3 className="text-3xl font-bold text-foreground mb-2">New password</h3>
                     <p className="text-slate-500 font-bold text-sm">Please configure a robust security password for your account.</p>
                  </div>

                  <form onSubmit={handleSetNewPassword} className="space-y-5">
                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">New Password</label>
                         <div className="relative">
                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                            <Input 
                               type="password" 
                               placeholder="••••••••" 
                               value={newPassword}
                               onChange={(e) => setNewPassword(e.target.value)}
                               required 
                               className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400/30 text-foreground"
                            />
                         </div>
                      </div>

                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">Confirm New Password</label>
                         <div className="relative">
                            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                            <Input 
                               type="password" 
                               placeholder="••••••••" 
                               value={confirmNewPassword}
                               onChange={(e) => setConfirmNewPassword(e.target.value)}
                               required 
                               className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400/30 text-foreground"
                            />
                         </div>
                      </div>

                      <Button 
                         type="submit" 
                         disabled={loading} 
                         className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] group shadow-lg shadow-primary/10"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                           <div className="flex items-center justify-center gap-2">
                             Reset Password and Sign In
                             <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                           </div>
                        )}
                     </Button>
                  </form>
               </>
            ) : (
               <>
                  <div className="mb-8 text-center lg:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-primary rounded-full text-[13px] font-bold mb-4 border border-border">
                        Secure access
                     </div>
                     <h3 className="text-3xl font-bold text-foreground mb-2">Sign in</h3>
                     <p className="text-slate-500 font-bold text-sm">Welcome back. Enter your credentials to access the admin portal.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-1.5 group">
                         <label className="text-[13px] font-bold text-slate-500 ml-1">Email address</label>
                        <div className="relative">
                           <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                           <Input 
                              type="email" 
                              placeholder="admin@culturemonitor.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                              className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400/30 text-foreground"
                           />
                        </div>
                     </div>

                      <div className="space-y-1.5 group">
                         <div className="flex items-center justify-between ml-1">
                            <label className="text-[13px] font-bold text-slate-500">Password</label>
                            <button
                               type="button"
                               onClick={() => setFlow("forgot")}
                               className="text-[11px] font-bold text-primary hover:underline transition-all"
                            >
                               Forgot password?
                            </button>
                         </div>
                        <div className="relative">
                           <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                           <Input 
                              type="password" 
                              placeholder="••••••••" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                              className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400/30 text-foreground"
                           />
                        </div>
                     </div>

                     <Button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all active:scale-[0.98] group shadow-lg shadow-primary/10"
                     >
                       {loading ? (
                         <Loader2 className="animate-spin" size={18} />
                       ) : (
                          <div className="flex items-center justify-center gap-2">
                            Verify and sign in
                            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                       )}
                    </Button>
                 </form>

                 <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                       <Link 
                          href="/" 
                          className="px-5 py-2.5 rounded-xl border border-border hover:border-slate-400 dark:hover:border-slate-600 transition-all text-[13px] font-medium text-slate-500 bg-card"
                       >
                          Return home
                       </Link>
                       <Link 
                          href="/register" 
                          className="px-5 py-2.5 rounded-xl border border-primary/20 hover:border-primary text-primary transition-all text-[13px] font-medium bg-secondary"
                       >
                          Create account
                       </Link>
                    </div>
                 </div>
               </>
            )}
         </div>
      </div>
    </div>
  );
}
