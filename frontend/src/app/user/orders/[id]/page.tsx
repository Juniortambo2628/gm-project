"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUserBooking, Booking, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package, CreditCard, Calendar, CheckCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuthGuard();
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
          <Card className="rounded-3xl border shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center justify-between">
                <span>{booking.service_name}</span>
                <span className={`text-sm px-3 py-1 rounded-full capitalize ${
                  booking.status === 'completed'
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
                    <p className="font-semibold">{new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CreditCard className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Amount</p>
                    <p className="font-semibold">{booking.currency} {Number(booking.amount).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">Reference</p>
                    <p className="font-semibold">{booking.stripe_payment_intent_id || booking.stripe_checkout_session_id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-2xl p-6">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Client</p>
                <p className="font-bold text-lg">{booking.name}</p>
                <p className="text-muted-foreground">{booking.email}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </PublicLayout>
  );
}
