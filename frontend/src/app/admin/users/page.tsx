"use client";
import React, { useEffect, useState } from "react";
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Calendar, 
  Mail, 
  Search, 
  Sparkles 
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/cms/users");
      setUsers(res.data);
    } catch (e) {
      toast.error("Failed to load user list");
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (id: number, currentRole: string) => {
    if (id === currentUser?.id) {
      toast.error("Security Restriction", {
        description: "You cannot change your own admin privileges directly."
      });
      return;
    }

    const newRole = currentRole === "admin" ? "participant" : "admin";
    const confirmMessage = `Are you sure you want to ${
      newRole === "admin" ? "promote this user to Admin" : "demote this user to Participant"
    }?`;

    if (!confirm(confirmMessage)) return;

    try {
      await axiosInstance.put(`/cms/users/${id}/role`, { role: newRole });
      toast.success(`Role updated successfully to ${newRole}`);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error("Security Restriction", {
        description: "Self-deletion is blocked. Contact system admin."
      });
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this user account? This action cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/cms/users/${id}`);
      toast.success("User account successfully deleted");
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete user account");
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
        <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-96 h-5" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <DashboardHero 
        title="User & Privilege Control" 
        description="Monitor registered participant accounts and promote staff to administrative roles." 
      />

      {/* Filter and stats row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-2xl p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-secondary/30 hover:bg-secondary/50 focus:bg-background border border-border/50 rounded-xl text-xs font-bold text-foreground placeholder-muted-foreground outline-none transition-all focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground px-2">
          <span>Total: <span className="text-foreground">{users.length}</span></span>
          <span className="h-4 w-px bg-border"></span>
          <span>Admins: <span className="text-primary">{users.filter(u => u.role === 'admin').length}</span></span>
          <span className="h-4 w-px bg-border"></span>
          <span>Participants: <span className="text-foreground">{users.filter(u => u.role !== 'admin').length}</span></span>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((item) => (
            <Card 
              key={item.id} 
              className={`rounded-2xl border shadow-sm transition-all overflow-hidden bg-card duration-200 ${
                item.id === currentUser?.id ? "border-primary/20 bg-primary/[0.01]" : "hover:border-primary/25"
              }`}
            >
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* User Credentials info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase tracking-widest ${
                    item.role === "admin" 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-secondary text-muted-foreground border"
                  }`}>
                    {item.name.substring(0, 2)}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate text-foreground leading-snug">{item.name}</p>
                      {item.id === currentUser?.id && (
                        <span className="px-2 py-0.5 bg-primary/15 text-primary text-[9px] font-black rounded-full uppercase border border-primary/25">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate">{item.email}</p>
                  </div>
                </div>

                {/* Role Badge and status */}
                <div className="flex-1 md:text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Access Role</p>
                  {item.role === "admin" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                      <Shield size={12} /> Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                      <User size={12} /> Participant
                    </span>
                  )}
                </div>

                {/* Account Date details */}
                <div className="flex-1 md:text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Joined Date</p>
                  <p className="text-xs font-semibold text-foreground flex items-center md:justify-center gap-1.5">
                    <Calendar size={13} className="text-muted-foreground" />
                    {new Date(item.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Actions block */}
                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 justify-end shrink-0">
                  <a href={`mailto:${item.email}`} title="Email User">
                    <Button variant="outline" className="h-10 w-10 p-0 border-border/50 hover:border-primary/30 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                      <Mail size={15} />
                    </Button>
                  </a>

                  <Button 
                    onClick={() => changeUserRole(item.id, item.role)} 
                    disabled={item.id === currentUser?.id}
                    variant="outline" 
                    title={item.role === "admin" ? "Demote to Participant" : "Promote to Admin"}
                    className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 border-border/50 ${
                      item.id === currentUser?.id 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:border-primary/45 text-foreground"
                    }`}
                  >
                    {item.role === "admin" ? <ShieldAlert size={14} className="text-amber-500" /> : <Shield size={14} className="text-primary" />}
                    {item.role === "admin" ? "Demote" : "Promote"}
                  </Button>

                  <Button 
                    onClick={() => deleteUser(item.id)} 
                    disabled={item.id === currentUser?.id}
                    variant="ghost" 
                    title="Delete Account"
                    className={`h-10 w-10 p-0 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 ${
                      item.id === currentUser?.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>

              </div>
            </Card>
          ))
        ) : (
          <Card className="rounded-3xl border-dashed border-2 p-16 text-center">
            <p className="text-muted-foreground font-medium italic">No accounts matching search criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
