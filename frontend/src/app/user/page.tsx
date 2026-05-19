"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useCMS } from "@/context/SettingContext";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { 
  CreditCard, 
  Calendar, 
  User, 
  ArrowLeft, 
  LogOut, 
  Loader2, 
  Sparkles, 
  Compass, 
  PhoneCall, 
  Clock, 
  BookOpen, 
  ExternalLink 
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { settings } = useCMS();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Guard routing
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Fetch bookings
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get("/user/bookings");
      setBookings(res.data);
    } catch (e) {
      toast.error("Failed to retrieve booking history");
    } finally {
      setLoadingBookings(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-sm font-semibold text-muted-foreground">Opening your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-500 relative">
      {/* Dynamic Header */}
      <SiteHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-32 space-y-12 relative z-10">
        {/* Banner Welcome Message */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10 shadow-2xl backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold border border-primary/20 uppercase tracking-wider">
                <Sparkles size={12} className="animate-spin-slow" /> Participant Dashboard
              </div>
              <h1 className="text-3xl md:text-5xl italic tracking-tight font-normal text-foreground">
                Welcome back, <span className="font-semibold text-primary">{user?.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground font-medium max-w-xl">
                Track your active coaching sessions, access scheduled prep programs, and monitor consultations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button 
                onClick={() => logout()}
                variant="outline"
                className="h-11 px-5 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
              >
                <LogOut size={14} /> Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Bookings list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Calendar size={18} className="text-primary" /> Active Bookings & Coaching
              </h2>
              <span className="px-3 py-1 rounded-full bg-secondary text-primary font-bold text-xs border">
                {bookings.length} {bookings.length === 1 ? "Session" : "Sessions"}
              </span>
            </div>

            {loadingBookings ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 bg-card border rounded-2xl animate-pulse p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-muted rounded"></div>
                      <div className="h-3 w-32 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className="overflow-hidden border border-border bg-card hover:border-primary/30 transition-all rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.005] duration-300"
                  >
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                          <CreditCard size={20} />
                        </div>
                        
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-bold text-foreground leading-snug truncate">
                              {booking.service_name}
                            </h3>
                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-500/25 animate-pulse">
                              Active / Paid
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(booking.created_at).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                            <span className="flex items-center gap-1.5"><Clock size={13} /> 10:00 AM (EAT)</span>
                            <span className="text-[10px] font-mono text-muted-foreground/60">ID: {booking.paystack_ref.substring(0, 10)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Amount Invested</p>
                          <p className="text-xl font-black text-primary uppercase">
                            {booking.currency} {parseFloat(booking.amount).toLocaleString([], {minimumFractionDigits: 2})}
                          </p>
                        </div>
                        <a 
                          href={settings['calendly_link'] || "https://calendly.com"} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <Button size="sm" className="h-10 px-4 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-1.5">
                            <PhoneCall size={13} /> Join / Schedule
                          </Button>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 rounded-3xl p-12 text-center bg-card/30 backdrop-blur-sm">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Compass size={28} className="text-muted-foreground/75" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No booked consultations yet</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto mb-6">
                  Ready to accelerate your dynamic admissions and professional profile breakthrough? Book a dedicated session today!
                </p>
                <Link href="/services">
                  <Button size="xl" className="shadow-xl shadow-primary/25 rounded-xl font-black text-xs px-6">
                    Explore Services & Coaching
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Right Column: Sidebar actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground border-b pb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" /> Active Assessment & Survey
            </h2>

            <Card className="rounded-3xl border bg-gradient-to-b from-card to-muted/20 shadow-md p-6 space-y-6">
              <div className="space-y-2">
                <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                  <BookOpen size={16} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Interactive Profile Assessment</h3>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                  Take the professional credentials and assessment poll to analyze the current index profile.
                </p>
              </div>

              <Link href="/survey?poll_id=1">
                <Button variant="outline" className="w-full rounded-xl border-primary/30 text-primary font-bold text-xs bg-secondary/35 h-11 flex items-center justify-center gap-2 transition-all">
                  Take Profile Survey <ExternalLink size={12} />
                </Button>
              </Link>
            </Card>

            <Card className="rounded-3xl border bg-card shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Support & Direct Consultation</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Have credentials inquiries or need quick technical support with your mock preparing or active services? Write directly to Gathoni.
              </p>
              <Link href="/contact">
                <Button variant="ghost" className="w-full rounded-xl text-primary hover:bg-secondary/40 font-bold text-xs h-10 border border-transparent hover:border-primary/25">
                  Contact Support
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      {/* Dynamic Footer */}
      <SiteFooter />
    </div>
  );
}
