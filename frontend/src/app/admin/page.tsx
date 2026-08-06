"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, DollarSign, Activity, Eye, ArrowUpRight } from "lucide-react";
import DashboardHero from "@/components/DashboardHero";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { KPICard } from "@/components/KPICard";

const RevenueChart = dynamic(() => import("@/components/admin/RevenueChart"), { ssr: false, loading: () => <div className="h-[350px] bg-muted/20 rounded-2xl animate-pulse" /> });

interface DashboardTransaction {
  id: number;
  customer_email: string;
  amount: string | number;
  created_at: string;
}

interface DashboardMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  service_interest?: string;
}

interface DashboardData {
  stats?: {
    total_revenue?: number;
    current_month_revenue?: number;
    total_transactions?: number;
    total_messages?: number;
  };
  recent_transactions?: DashboardTransaction[];
  recent_messages?: DashboardMessage[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (authLoading || !isAuthenticated) return;
      
      try {
        const res = await axiosInstance.get("/cms/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated, authLoading]);

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
         <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4">
            <div className="h-8 w-48 bg-muted rounded-md" />
            <div className="h-5 w-96 bg-muted rounded-md" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-muted rounded-2xl lg:col-span-2" />
            <div className="h-96 bg-muted rounded-2xl" />
         </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <DashboardHero 
        title="Business Analytics" 
        description="Monitor your consulting revenue, bookings, and recent inquiries." 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total revenue"
          value={`$${data?.stats?.total_revenue || 0}`}
          description={
            <span className="text-emerald-500 inline-flex items-center">
              <ArrowUpRight size={12}/> +${data?.stats?.current_month_revenue || 0}
            </span>
          }
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />

        <KPICard
          title="Successful bookings"
          value={data?.stats?.total_transactions || 0}
          description="Paid coaching sessions"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />

        <KPICard
          title="Inquiries"
          value={data?.stats?.total_messages || 0}
          description="Messages from contact form"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />

        <KPICard
          title="Profile views"
          value="--"
          description="Integration pending"
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-4 bg-card shadow-sm border-border block border overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription className="font-bold italic">Monthly earnings from Paystack transactions</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 relative min-h-[350px]">
            <div className="w-full h-[350px]">
              <RevenueChart revenue={data?.stats?.current_month_revenue || 0} />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
            <Card className="bg-card shadow-sm border-border">
              <CardHeader>
                <CardTitle>Recent bookings</CardTitle>
                <CardDescription>Latest successful payments.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {data?.recent_transactions && data.recent_transactions.length > 0 ? data.recent_transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="space-y-1">
                      <p className="text-sm font-bold leading-none">{t.customer_email}</p>
                      <p className="text-xs text-muted-foreground font-medium">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="font-bold text-primary">${t.amount}</div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No transactions yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border-border">
              <CardHeader>
                <CardTitle>Recent messages</CardTitle>
                <CardDescription>Inquiries from the contact form.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {data?.recent_messages && data.recent_messages.length > 0 ? data.recent_messages.map((m) => (
                  <div key={m.id} className="bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-sm font-bold leading-none">{m.name}</p>
                       <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                          {m.service_interest}
                       </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-3">{m.email}</p>
                    <p className="text-sm text-foreground italic border-l-2 border-primary/20 pl-3">&ldquo;{m.message}&rdquo;</p>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No messages yet.</p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
