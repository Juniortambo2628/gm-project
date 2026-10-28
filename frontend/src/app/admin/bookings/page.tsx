"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, ExternalLink, Activity, RefreshCcw } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Booking } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { reconcilePendingPayments } from "@/lib/api";
import { toast } from "sonner";
import { useAdminPaginatedList } from "@/hooks/useAdminPaginatedList";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";

export default function BookingsPage() {
  const [reconciling, setReconciling] = useState(false);
  const { data, loading, search, setSearch, filters, setFilter, page, setPage, meta } = useAdminPaginatedList<Booking>("/cms/orders", "Failed to fetch bookings");

  const reconcile = async () => {
    setReconciling(true);
    try {
      const result = await reconcilePendingPayments();
      toast.success(result.message);
    } catch {
      toast.error("Could not reconcile pending payments");
    } finally {
      setReconciling(false);
    }
  };

  return (
    <AdminListPage title="Bookings & Payments" description="Monitor payment and appointment status. Reconciliation runs when you request it." action={<Button onClick={reconcile} disabled={reconciling} variant="outline">{reconciling ? <RefreshCcw className="mr-2 animate-spin" size={15} /> : <RefreshCcw className="mr-2" size={15} />}Reconcile pending payments</Button>} isLoading={loading}>
      <AdminListToolbar search={search} onSearchChange={setSearch} placeholder="Search by client, email, or payment reference" filters={[{ key: "status", label: "Payment status", options: [{ value: "", label: "All payments" }, { value: "success", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] }]} values={filters} onFilterChange={setFilter} dateRange total={meta.total} page={page} lastPage={meta.last_page} onPageChange={setPage} />
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
                     {(() => {
                        const status = (item.status || 'pending').toLowerCase();
                        const style = status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700';
                        return (
                          <span className={`px-2 py-0.5 ${style} text-[10px] font-bold rounded-full uppercase`}>{status}</span>
                        );
                     })()}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">{item.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Appointment: <span className="capitalize">{item.appointment?.status ?? "Not scheduled"}</span> · Confirmation: {item.email_sent_at ? "sent" : "pending"}</p>
                  <Link href={`/admin/clients/payment/${item.id}`} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open client history</Link>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Service</p>
                  <p className="text-sm font-bold truncate">{item.service_name}</p>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Amount</p>
                   <p className="text-lg font-black text-primary">{formatCurrency(item.amount, item.currency)}</p>
               </div>

               <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</p>
                  <p className="text-sm font-medium text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
               </div>

               <div className="flex items-center gap-2 text-primary font-bold text-[11px] underline underline-offset-4 cursor-pointer hover:opacity-70">
                  <ExternalLink size={14} /> Stripe: {(item.stripe_payment_intent_id || item.stripe_checkout_session_id || '').substring(0, 16)}...
               </div>
            </div>
          </Card>
        )) : (
          <EmptyState
            icon={<Activity size={32} className="opacity-20" />}
            title="No transactions found yet."
          />
        )}
      </div>
    </AdminListPage>
  );
}
