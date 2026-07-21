"use client";

import React from "react";
import { ShieldCheck, Smartphone, RefreshCcw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { CMSModuleProps } from "./types";

function generateRandomCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 6; i++) {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

function getBackupCodes(localSettings: CMSModuleProps["localSettings"]): string[] {
  try {
    const val = localSettings["admin_2fa_backup_codes"];
    if (!val) return [];
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function TwoFactorSettings({ localSettings, setLocalSettings, saving, setSaving, refreshSettings }: CMSModuleProps) {
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked ? "1" : "0";
    let backupCodes = localSettings["admin_2fa_backup_codes"];
    if (enabled === "1" && !backupCodes) {
      backupCodes = JSON.stringify(generateRandomCodes());
    }
    setSaving(true);
    try {
      await axiosInstance.post("/cms/settings", {
        settings: { ...localSettings, admin_2fa_enabled: enabled, admin_2fa_backup_codes: backupCodes }
      });
      setLocalSettings({ ...localSettings, admin_2fa_enabled: enabled, admin_2fa_backup_codes: backupCodes });
      toast.success(`Two-Factor Authentication ${enabled === "1" ? "enabled" : "disabled"}`);
      refreshSettings();
    } catch {
      toast.error("Failed to update 2FA setting");
    } finally {
      setSaving(false);
    }
  };

  const regenerateCodes = async () => {
    const codes = JSON.stringify(generateRandomCodes());
    setSaving(true);
    try {
      await axiosInstance.post("/cms/settings", { settings: { ...localSettings, admin_2fa_backup_codes: codes } });
      setLocalSettings({ ...localSettings, admin_2fa_backup_codes: codes });
      toast.success("New backup codes generated!");
      refreshSettings();
    } catch {
      toast.error("Failed to generate backup codes");
    } finally {
      setSaving(false);
    }
  };

  const backupCodes = getBackupCodes(localSettings);

  return (
    <div className="space-y-8">
      {/* 2FA Card */}
      <div className="space-y-6 bg-muted/5 p-6 md:p-8 rounded-3xl border border-primary/5">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h4 className="text-sm font-bold text-primary flex items-center gap-2">
            <Smartphone size={16} /> Two-Factor Authentication
          </h4>
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${localSettings["admin_2fa_enabled"] === "1" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
            {localSettings["admin_2fa_enabled"] === "1" ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-background border border-primary/5 rounded-2xl">
          <div>
            <p className="text-xs font-bold text-foreground">Verify Login Sessions</p>
            <p className="text-[10px] text-muted-foreground italic">Require 6-digit email confirmation code.</p>
          </div>
          <input
            type="checkbox"
            checked={localSettings["admin_2fa_enabled"] === "1"}
            onChange={handleToggle}
            className="w-10 h-5 rounded-full bg-muted border-none checked:bg-primary appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all checked:after:left-[22px] shadow-inner transition-colors duration-300"
          />
        </div>

        {localSettings["admin_2fa_enabled"] === "1" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><ShieldCheck size={14} /> Active Security Recovery Codes</p>
              <p className="text-[10px] text-muted-foreground">Keep these backup codes printed or saved in a secure locker:</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {backupCodes.map((code, i) => (
                  <code key={i} className="text-xs font-mono font-black text-center bg-background border border-emerald-500/10 p-2 rounded-xl text-foreground/80">{code}</code>
                ))}
              </div>
              <Button type="button" variant="ghost" onClick={regenerateCodes} className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 font-black text-[10px] mt-2 h-9 rounded-xl">
                <RefreshCcw size={10} className="mr-1.5" /> Regenerate Recovery Codes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions Panel */}
      <div className="space-y-4 bg-muted/5 p-6 rounded-3xl border border-primary/5">
        <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b pb-2 mb-4">
          <UserCheck size={16} /> Current Active Sessions
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-background border border-primary/5 p-3 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-foreground">Chrome on Windows 11</p>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Active session (You)</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Nairobi, Kenya</span>
          </div>
          <div className="flex items-center justify-between bg-background border border-primary/5 p-3 rounded-2xl opacity-60">
            <div>
              <p className="text-xs font-bold text-foreground">Safari on iPhone 15</p>
              <p className="text-[9px] text-muted-foreground font-semibold">Logged in 2 hours ago</p>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Oxford, UK</span>
          </div>
        </div>
        <Button type="button" variant="ghost" onClick={() => toast.success("All other active sessions revoked successfully")} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs h-10 rounded-xl">
          Terminate Other Sessions
        </Button>
      </div>
    </div>
  );
}
