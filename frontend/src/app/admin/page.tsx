"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { MessageSquare, DollarSign, Activity, Eye, ArrowUpRight } from "lucide-react";
import DashboardHero from "@/components/DashboardHero";
import axiosInstance from "@/lib/axios";
import { IconBlock } from "@/components/ui/IconBlock";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (authLoading || !isAuthenticated) return;
      
      try {
        const res = await axiosInstance.get("/cms/dashboard");
        setData(res.data);
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated, authLoading]);

  const revenueChartData = useMemo(() => {
    const rev = data?.stats?.current_month_revenue || 0;
    return [
      { name: "Jan", total: 0 },
      { name: "Feb", total: 0 },
      { name: "Mar", total: 0 },
      { name: "Apr", total: rev },
      { name: "May", total: 0 },
      { name: "Jun", total: 0 },
    ];
  }, [data]);

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
         <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4">
            <Skeleton variant="text" className="w-48 h-8" />
            <Skeleton variant="text" className="w-96 h-5" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton variant="rect" className="h-32 rounded-2xl" />
            <Skeleton variant="rect" className="h-32 rounded-2xl" />
            <Skeleton variant="rect" className="h-32 rounded-2xl" />
            <Skeleton variant="rect" className="h-32 rounded-2xl" />
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton variant="rect" className="h-96 rounded-2xl lg:col-span-2" />
            <Skeleton variant="rect" className="h-96 rounded-2xl" />
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
        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Total revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${data?.stats?.total_revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 inline-flex items-center"><ArrowUpRight size={12}/> +${data?.stats?.current_month_revenue || 0}</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Successful bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{data?.stats?.total_transactions || 0}</div>
            <p className="text-xs text-muted-foreground">Paid coaching sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{data?.stats?.total_messages || 0}</div>
            <p className="text-xs text-muted-foreground">Messages from contact form</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Profile views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Integration pending</p>
          </CardContent>
        </Card>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--primary)/0.05)'}} 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'hsl(var(--card))', boxShadow: 'var(--shadow)', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                {data?.recent_transactions?.length > 0 ? data.recent_transactions.map((t: any) => (
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
                {data?.recent_messages?.length > 0 ? data.recent_messages.map((m: any) => (
                  <div key={m.id} className="bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-sm font-bold leading-none">{m.name}</p>
                       <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                          {m.service_interest}
                       </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mb-3">{m.email}</p>
                    <p className="text-sm text-foreground italic border-l-2 border-primary/20 pl-3">"{m.message}"</p>
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
