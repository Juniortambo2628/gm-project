"use client";

import React, { useState } from "react";
import { Lock, RefreshCcw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChanging(true);
    try {
      await axiosInstance.post("/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 bg-muted/5 p-6 md:p-8 rounded-3xl border border-primary/5">
      <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
        <KeyRound size={16} /> Administrative Password
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
          <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
          <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
          <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" />
        </div>
        <Button type="submit" disabled={changing} className="w-full h-12 rounded-xl mt-4 font-bold text-xs">
          {changing ? <RefreshCcw className="animate-spin mr-2" size={14} /> : <Lock className="mr-2" size={14} />}
          Update Password
        </Button>
      </form>
    </div>
  );
}
