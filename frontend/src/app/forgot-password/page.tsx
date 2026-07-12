"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword, getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success("Security code generated", {
        description: `A dynamic verification code has been dispatched to ${email}.`
      });
    } catch (err) {
      toast.error("Request Failed", {
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

        {submitted ? (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[13px] font-bold border border-emerald-500/20">
              <ShieldCheck size={12} /> Code sent
            </div>
            <h3 className="text-3xl font-bold text-foreground">Check your email</h3>
            <p className="text-slate-500 font-bold text-sm">
              A security reset code has been sent to <span className="text-primary font-black">{email}</span>.
            </p>
            <Button onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)} className="w-full h-12 rounded-xl font-bold">
              Continue to reset password
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-2">Reset password</h3>
              <p className="text-slate-500 font-bold text-sm">Enter your email address and we&apos;ll dispatch a password reset code.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="text-[13px] font-bold text-slate-500 ml-1">Email address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  "Request reset code"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
