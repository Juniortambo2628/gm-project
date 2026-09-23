"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUserBooking, Booking, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package, CreditCard, Calendar, CheckCircle, Globe } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { formatCurrency } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";

const InlineWidget = dynamic(() => import("react-calendly").then((mod) => mod.InlineWidget), {
  ssr: false,
});

const calendlySettingKeyMap: Record<string, string> = {
  mba: 'mba_calendly_url',
  consulting: 'consulting_calendly_url',
  discovery: 'discovery_calendly_url',
};

function formatBookedDate(raw?: string): string {
  if (!raw) return "—";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function OrderDetailPage() {
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuthGuard();
  const { getSetting } = useSiteSettings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const id = Number(params.id);

  useEffect(() => {
    if (!isAuthenticated || Number.isNaN(id)) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const data = await getUserBooking(id);
        setBooking(data);
      } catch (err) {
        toast.error("Could not load booking", { description: getErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [isAuthenticated, id]);

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  const serviceName = booking?.service?.name ?? "Coaching session";
  const reference = booking?.stripe_payment_intent_id || booking?.stripe_checkout_session_id || "—";
  const amountNumber = booking ? Number(booking.amount) : NaN;
  const amountLabel = Number.isFinite(amountNumber) ? formatCurrency(amountNumber, booking?.currency) : "—";

  // Show Calendly for paid bookings so the client can schedule (or reschedule)
  // their session from their account even if the redirect after checkout
  // silently swallowed the calendar step.
  const paid = booking?.status === 'success';
  const settingKey = booking?.service?.type ? calendlySettingKeyMap[booking.service.type] : undefined;
  const calendlyUrl = settingKey ? getSetting(settingKey) : undefined;

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-6 py-32">
        <div className="mb-8">
          <Link href="/user" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline py-2">
            <ArrowLeft size={18} /> Back to orders
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">Order #{id}</h1>
          <p className="text-muted-foreground font-medium">View your booking details and status.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : !booking ? (
          <Card className="rounded-3xl border shadow-sm text-center py-16">
            <CardContent>
              <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Booking not found</h2>
              <p className="text-muted-foreground mb-6">We could not locate that booking in your account.</p>
              <Link href="/user" className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
                Back to orders
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>{serviceName}</span>
                  <span className={`text-sm px-3 py-1 rounded-full capitalize ${
                    booking.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">Booked on</p>
                      <p className="font-semibold">{formatBookedDate(booking.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CreditCard className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">Amount</p>
                      <p className="font-semibold">{amountLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 sm:col-span-2">
                    <CheckCircle className="text-primary mt-1" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Reference</p>
                      <p className="font-semibold text-sm break-all">{reference}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Client</p>
                  <p className="font-bold text-lg">{booking.name || "—"}</p>
                  <p className="text-muted-foreground">{booking.email || "—"}</p>
                </div>
              </CardContent>
            </Card>

            {paid && calendlyUrl ? (
              <Card className="rounded-3xl border shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-500/10 border-b">
                  <CardTitle className="text-lg">Schedule your session</CardTitle>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Your payment is confirmed. Pick a time that works for you — you can also come back here later to reschedule.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-16 bg-secondary/40 flex items-center justify-between px-6 border-b">
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                      <Globe size={12} /> Timezone detect: Auto
                    </span>
                  </div>
                  <div className="h-[720px]">
                    <InlineWidget
                      key={calendlyUrl as string}
                      url={calendlyUrl as string}
                      styles={{ height: '100%', width: '100%' }}
                      prefill={{
                        email: booking.email,
                        name: booking.name,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : paid && !calendlyUrl ? (
              <Card className="rounded-3xl border shadow-sm">
                <CardContent className="p-8">
                  <p className="text-sm font-semibold">Scheduling link not yet configured for this service.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please <Link href="/contact" className="text-primary underline">contact us</Link> and we&apos;ll get you on the calendar.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
