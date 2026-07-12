"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { verifyResetCode, resetPassword, getErrorMessage } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"code" | "password">(emailFromQuery ? "code" : "code");

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await verifyResetCode(tempToken || "", code);
      setResetToken(data.reset_token);
      setStep("password");
      toast.success("Code verified successfully!", {
        description: "Please configure your new security credentials."
      });
    } catch (err) {
      toast.error("Verification Failed", {
        description: getErrorMessage(err)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Validation Error", { description: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword, confirmPassword);
      toast.success("Security credentials updated", {
        description: "You may now sign in using your new password."
      });
      router.push("/login");
    } catch (err) {
      toast.error("Reset Failed", {
        description: getErrorMessage(err)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md relative z-10">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft size={14} /> Back to login
        </Link>

        {step === "code" ? (
          <>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[13px] font-bold mb-4 border border-emerald-500/20">
                <ShieldCheck size={12} /> Security Check
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Enter reset code</h3>
              <p className="text-slate-500 font-bold text-sm">
                A security reset code has been sent to <span className="text-primary font-black">{email || "your email"}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-5">
              {!emailFromQuery && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-500 ml-1">Email address</label>
                  <Input 
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-card border-border rounded-xl shadow-sm font-medium text-foreground"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-500 ml-1">Temporary token (optional)</label>
                <Input 
                  type="text"
                  placeholder="Paste temporary token if provided"
                  value={tempToken}
                  onChange={(e) => setTempToken(e.target.value)}
                  className="h-12 bg-card border-border rounded-xl shadow-sm font-medium text-foreground"
                />
              </div>
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-bold text-slate-500 ml-1">Reset Code</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required 
                    className="h-12 pl-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold tracking-widest text-foreground text-center text-lg placeholder:text-slate-400/30 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
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
                  "Verify and Proceed"
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-2">New password</h3>
              <p className="text-slate-500 font-bold text-sm">Please configure a robust security password for your account.</p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-5">
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  "Reset Password and Sign In"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
