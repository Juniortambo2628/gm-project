"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, ExternalLink, Activity } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Booking } from "@/lib/api";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function BookingsPage() {
  const { data, loading } = useAdminFetch<Booking[]>("/cms/orders", {
    errorMessage: "Failed to fetch bookings",
  });

  return (
    <AdminListPage title="Bookings & Payments" description="Monitor successful registrations and consulting payments." isLoading={loading}>
      <div className="grid grid-cols-1 gap-4">
        {data.length > 0 ? data.map((item) => (
          <Card key={item.id} className="rounded-2xl border shadow-sm hover:border-primary/20 transition-all overflow-hidden bg-card">
            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
               <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <CreditCard size={20} />
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <p className="text-sm font-bold truncate">{item.name}</p>
                     <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Success</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">{item.email}</p>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Service</p>
                  <p className="text-sm font-bold truncate">{item.service_name}</p>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Amount</p>
                  <p className="text-lg font-black text-primary">${item.amount}</p>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</p>
                  <p className="text-sm font-medium text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
               </div>

               <div className="flex items-center gap-2 text-primary font-bold text-[11px] underline underline-offset-4 cursor-pointer hover:opacity-70">
                  <ExternalLink size={14} /> Paystack Ref: {item.paystack_ref.substring(0, 8)}...
               </div>
            </div>
          </Card>
        )) : (
          <Card className="rounded-3xl border-dashed border-2 p-20 text-center">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                <Activity size={32} />
             </div>
             <p className="text-muted-foreground font-medium italic">No transactions found yet.</p>
          </Card>
        )}
      </div>
    </AdminListPage>
  );
}
