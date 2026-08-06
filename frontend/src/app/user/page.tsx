"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUserBookings, Booking, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ShoppingBag, User, ArrowRight, Package } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthGuard();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        toast.error("Could not load bookings", { description: getErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <PublicLayout>
      <main className="max-w-5xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome back, {user?.name || "Guest"}</h1>
            <p className="text-muted-foreground font-medium">Manage your bookings and account settings.</p>
          </div>
          <Link href="/book" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">
            <ShoppingBag className="mr-2" size={18} /> Book a service
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package size={18} className="text-primary" /> Total bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User size={18} className="text-primary" /> Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <Link href="/user/profile" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                Edit profile <ArrowRight size={14} className="ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
            <CardDescription>Your latest service bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-6">You have not made any bookings yet.</p>
                <Link href="/book" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90">Book now</Link>
              </div>
            ) : (
              <div className="divide-y">
                {bookings.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-bold">{booking.service_name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()} · {booking.currency} {Number(booking.amount).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        booking.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                      <Link href={`/user/orders/${booking.id}`} className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-border bg-background text-xs font-semibold hover:bg-muted">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </PublicLayout>
  );
}
