"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { updateProfile, changePassword, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Lock, User, Mail, Save } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FormFeedback } from "@/components/ui/FormFeedback";

export default function UserProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  useAuthGuard();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    setProfileFeedback(null);
    try {
      await updateProfile(formData);
      toast.success("Profile updated", { description: "Your account details have been saved." });
      setProfileFeedback({ type: "success", message: "Your account details have been saved." });
      if (refreshUser) await refreshUser();
    } catch (err) {
      setProfileFeedback({ type: "error", message: getErrorMessage(err) });
      toast.error("Update failed", {
        description: getErrorMessage(err)
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setPasswordFeedback({ type: "error", message: "New password and confirmation do not match." });
      toast.error("Validation Error", { description: "Passwords do not match." });
      return;
    }
    setIsSubmittingPassword(true);
    try {
      await changePassword(passwordData);
      toast.success("Password changed", { description: "Your password has been updated successfully." });
      setPasswordFeedback({ type: "success", message: "Your password has been updated successfully." });
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
    } catch (err) {
      setPasswordFeedback({ type: "error", message: getErrorMessage(err) });
      toast.error("Password change failed", {
        description: getErrorMessage(err)
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-6 py-32">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Your profile</h1>
          <p className="text-muted-foreground font-medium">Manage your account details and security credentials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-primary" /> Account details
              </CardTitle>
              <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6" aria-busy={isSubmittingProfile}>
                {profileFeedback && <FormFeedback {...profileFeedback} />}
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-xs font-bold uppercase text-muted-foreground">Name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 pl-11 rounded-xl bg-secondary/50 border-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 pl-11 rounded-xl bg-secondary/50 border-none font-medium"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingProfile} className="w-full h-12 rounded-xl font-bold">
                  {isSubmittingProfile ? (
                    <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</>
                  ) : (
                    <><Save size={16} className="mr-2" /> Save changes</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} className="text-primary" /> Security
              </CardTitle>
              <CardDescription>Change your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6" aria-busy={isSubmittingPassword}>
                {passwordFeedback && <FormFeedback {...passwordFeedback} />}
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-xs font-bold uppercase text-muted-foreground">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="h-12 rounded-xl bg-secondary/50 border-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-xs font-bold uppercase text-muted-foreground">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="h-12 rounded-xl bg-secondary/50 border-none font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password" className="text-xs font-bold uppercase text-muted-foreground">Confirm new password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={passwordData.new_password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                    className="h-12 rounded-xl bg-secondary/50 border-none font-medium"
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmittingPassword} className="w-full h-12 rounded-xl font-bold">
                  {isSubmittingPassword ? (
                    <><Loader2 className="animate-spin mr-2" size={16} /> Updating...</>
                  ) : (
                    <><Lock size={16} className="mr-2" /> Change password</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicLayout>
  );
}
