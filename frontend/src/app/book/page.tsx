"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Briefcase, MapPin, Phone, MessageSquare, CheckCircle2, Globe, Loader2, PhoneCall, CalendarCheck } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCMSContent } from "@/context/CMSContentContext";
import { useAuth } from "@/context/AuthContext";
import { IconBlock } from "@/components/ui/IconBlock";
import dynamic from "next/dynamic";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { countries } from "@/lib/data/countries";
import { createTransaction, createCheckoutSession, reserveBookingSlot } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

const StripeCheckoutButton = dynamic(() => import("@/components/StripeCheckoutButton"), { 
  ssr: false,
  loading: () => (
    <Button disabled className="w-full h-16 rounded-2xl bg-primary/50 text-white font-bold text-sm">
      <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Initializing...
    </Button>
  )
});

const InlineWidget = dynamic(() => import("react-calendly").then((mod) => mod.InlineWidget), {
  ssr: false,
});

// Map service type to the correct Calendly Setting key
const calendlySettingKeyMap: Record<string, string> = {
  mba: 'mba_calendly_url',
  consulting: 'consulting_calendly_url',
  discovery: 'discovery_calendly_url',
};

import type { LucideIcon } from "lucide-react";

// Map service type to icons
const serviceIconMap: Record<string, LucideIcon> = {
  mba: GraduationCap,
  consulting: Briefcase,
  discovery: PhoneCall,
};

// A Calendly slot the client reserved but hasn't paid for yet. Kept in
// sessionStorage so it survives the Stripe redirect (cancel or return) and sign-in.
interface ReservedSlot {
  serviceId: number;
  eventUri: string;
  inviteeUri: string;
  holdExpiresAt?: string;
}

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  expectations: string;
};

const PENDING_BOOKING_KEY = "gm_pending_booking";

function loadPendingBooking(): { slot: ReservedSlot | null; form: Partial<BookingFormData> } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePendingBooking(slot: ReservedSlot | null, form: BookingFormData) {
  try {
    if (slot) {
      sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify({ slot, form }));
    } else {
      sessionStorage.removeItem(PENDING_BOOKING_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.) — the reservation just won't survive a reload.
  }
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { services } = useCMSContent();
  const { getSetting, getHeroProps } = useSiteSettings();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [reservedSlot, setReservedSlot] = useState<ReservedSlot | null>(null);
  const payButtonRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    expectations: ""
  });

  // Restore a reserved-but-unpaid slot (e.g. after cancelling on Stripe or signing in).
  useEffect(() => {
    const pending = loadPendingBooking();
    if (!pending?.slot) return;
    setReservedSlot(pending.slot);
    setSelectedServiceId(pending.slot.serviceId);
    setFormData((prev) => ({ ...prev, ...pending.form }));
  }, []);

  useEffect(() => {
    savePendingBooking(reservedSlot, formData);
  }, [reservedSlot, formData]);

  // Prefill from the signed-in profile so the checkout email matches the account.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
  }, [isAuthenticated, user]);

  useEffect(() => {
    setMounted(true);
    if (services.length > 0 && !selectedServiceId) {
      // Functional update so a service restored from a pending booking isn't overwritten.
      setSelectedServiceId((prev) => prev ?? services[0].id);
    }
  }, [services, selectedServiceId]);

  // Poll for payment status after redirect
  useEffect(() => {
    if (!sessionId) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status/${sessionId}`);
        const data = await res.json();
        if (data.data?.transaction_status === "success") {
          setPaymentConfirmed(true);
          setReservedSlot(null);
          toast.success("Payment successful!", {
            description: "Your session is now confirmed. Check your email for details."
          });
          // Clear the session_id from URL
          window.history.replaceState({}, "", "/book/");
        }
      } catch {
        // Ignore polling errors
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    const timeout = setTimeout(() => clearInterval(interval), 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [sessionId]);

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const price = selectedService?.price || 0;

  // Resolve the correct Calendly URL for the selected service
  const calendlySettingKey = selectedService
    ? (calendlySettingKeyMap[selectedService.type] || 'discovery_calendly_url')
    : 'discovery_calendly_url';
  const calendlyUrl = getSetting(calendlySettingKey) || "https://calendly.com/gathoni-mwai0/gm-discovery-call";

  useEffect(() => {
    const handleCalendlyEvent = async (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;

      // Paid sessions: the slot is reserved first, payment is the last step.
      if (e.data?.event === 'calendly.event_scheduled' && price > 0 && selectedService) {
        const slot: ReservedSlot = {
          serviceId: selectedService.id,
          eventUri: e.data.payload?.event?.uri ?? "",
          inviteeUri: e.data.payload?.invitee?.uri ?? "",
        };
        setReservedSlot(slot);
        toast.success("Time slot reserved", {
          description: "Complete payment to confirm your booking.",
        });
        payButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

        if (slot.inviteeUri) {
          try {
            const reservation = await reserveBookingSlot({
              service_id: slot.serviceId,
              calendly_invitee_uri: slot.inviteeUri,
              name: formData.name,
              email: formData.email,
            });
            setReservedSlot((prev) =>
              prev?.inviteeUri === slot.inviteeUri ? { ...prev, holdExpiresAt: reservation.hold_expires_at } : prev
            );
          } catch {
            // Non-blocking: the client can still pay; the slot just won't be auto-released.
          }
        }
        return;
      }

      if (e.data?.event === 'calendly.event_scheduled' && price === 0) {
        const inviteeUri = e.data.payload.invitee.uri;
        
        try {
          await createTransaction({
            name: formData.name,
            email: formData.email,
            amount: 0,
            currency: selectedService?.currency || 'GBP',
            service_id: selectedService?.id,
            stripe_checkout_session_id: `calendly_${inviteeUri.split('/').pop()}`,
            status: 'success'
          });
          
          toast.success("Booking confirmed!", {
            description: "Your session has been recorded. Check your email for details."
          });
          setFormData({ name: "", email: "", phone: "", location: "", expectations: "" });
        } catch (err) {
          console.error(err);
          toast.error("Booking recording error", {
            description: "Session scheduled on Calendly, but we couldn't log it on our website. Please notify support."
          });
        } finally {
          // recording done
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, [formData, price, selectedService]);

  if (!mounted) return null;

  const detailsComplete = !!(formData.email && formData.name && formData.phone) && isAuthenticated;
  const slotReserved = !!reservedSlot && reservedSlot.serviceId === selectedService?.id;
  const canPay = detailsComplete && slotReserved;
  // Paid sessions show availability once details are in, so clients only pay for a time that works.
  const calendarLocked = price > 0
    ? !detailsComplete
    : (!formData.name || !formData.email);

  const breadcrumbs = [
    { label: "Booking", path: "/book" },
    { label: "Strategy session" }
  ];

  const handlePaymentClick = async () => {
    if (!selectedService || price <= 0) return;

    setIsRedirecting(true);
    try {
      const result = await createCheckoutSession({
        service_id: selectedService.id,
        name: formData.name,
        email: formData.email,
        calendly_invitee_uri: reservedSlot?.inviteeUri || undefined,
        calendly_event_uri: reservedSlot?.eventUri || undefined,
      });

      if (result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else if (result.code === "slot_released") {
        setReservedSlot(null);
        toast.error("Your reserved slot was released", {
          description: result.message || "Payment wasn't completed in time. Please pick a new time.",
        });
        setIsRedirecting(false);
      } else {
        toast.error("Payment error", {
          description: result.message || "Could not initialize payment. Please try again.",
        });
        setIsRedirecting(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not initialize payment. Please try again.";
      toast.error("Payment error", { description: message });
      setIsRedirecting(false);
    }
  };

  return (
    <PublicLayout
      hero={{
        title: getSetting('book_hero_title', "Secure your session"),
        subtitle: getSetting('book_hero_subtitle', "Choose your pathway, pick a time that works for you, then pay securely via Stripe."),
        badge: "Booking system",
        breadcrumbs,
        ...getHeroProps('book_hero_bg')
      }}
    >
      <main className="pb-20 pt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Form & Selection */}
            <div className="flex-1 space-y-10">
              {/* Payment Confirmed Banner */}
              {paymentConfirmed && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                  <div className="flex gap-4">
                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg h-fit">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-400 text-sm italic">Payment confirmed!</h4>
                      <p className="text-xs text-emerald-800/60 dark:text-emerald-400/60 font-medium leading-relaxed mt-1">
                        Your session is booked. Check your email for booking details and your Zoom link.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {services.map((s) => {
                  const ServiceIcon = serviceIconMap[s.type] || Briefcase;
                  return (
                    <button 
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      disabled={!!reservedSlot && reservedSlot.serviceId !== s.id}
                      title={reservedSlot && reservedSlot.serviceId !== s.id ? "You have a reserved slot for another service" : undefined}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 h-full disabled:opacity-40 disabled:cursor-not-allowed ${selectedServiceId === s.id ? 'bg-primary/5 border-primary ring-4 ring-primary/5' : 'bg-card border-border hover:border-primary/20'}`}
                    >
                      <IconBlock icon={ServiceIcon} className={selectedServiceId === s.id ? 'bg-primary text-white' : 'bg-secondary text-primary'} />
                      <div>
                        <p className="font-bold italic">{s.name}</p>
                        <p className="text-2xl font-bold text-primary">
                          {s.price === 0 ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            <>
                               {formatCurrency(Number(s.price), s.currency)}{ ' ' }
                              <span className="text-[10px] opacity-40 font-bold"> / hr</span>
                            </>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Booking Form */}
              <div className="p-8 md:p-10 bg-card rounded-3xl border border-border space-y-6 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground ml-1">Full name</Label>
                    <div className="relative">
                      <Input 
                        placeholder="e.g. Gathoni Mwai"
                        required
                        className="h-14 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground ml-1">Email address</Label>
                    <Input 
                      type="email"
                      placeholder="e.g. hello@africa.com"
                      required
                      className="h-14 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground ml-1">Phone number</Label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                            <Phone size={18} />
                         </div>
                         <Input 
                            placeholder="+254 7XX XXX XXX"
                            required
                            className="h-14 pl-12 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground ml-1">Current location</Label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none">
                            <MapPin size={18} />
                         </div>
                         <select 
                           className="w-full h-14 pl-12 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 font-medium appearance-none outline-none"
                           value={formData.location}
                           onChange={(e) => setFormData({...formData, location: e.target.value})}
                           required
                         >
                            <option value="">Select country</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <Label className="text-[10px] font-bold text-muted-foreground ml-1">What are your expectations for this session?</Label>
                  <textarea 
                    className="w-full min-h-[120px] p-6 rounded-2xl bg-secondary/50 border-none focus:ring-2 focus:ring-primary/20 font-medium outline-none resize-none"
                    placeholder="Tell me a bit about your background and what you're hoping to achieve..."
                    value={formData.expectations}
                    onChange={(e) => setFormData({...formData, expectations: e.target.value})}
                    required
                  />
                </div>

                  {!authLoading && !isAuthenticated ? (
                     <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-4">
                       <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 text-primary rounded-lg h-fit">
                           <LogIn size={18} />
                         </div>
                         <div className="flex-1">
                           <h4 className="font-bold text-sm">Sign in to complete your booking</h4>
                           <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                             We tie every payment to an account so you can view your booking, reschedule the call, and get reminders. Signing in only takes a moment.
                           </p>
                         </div>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-3">
                         <Link href="/login?redirect=%2Fbook%2F" className="flex-1">
                           <Button className="w-full h-12 rounded-2xl bg-primary text-white font-bold">
                             Sign in
                           </Button>
                         </Link>
                         <Link href="/register?redirect=%2Fbook%2F" className="flex-1">
                           <Button variant="outline" className="w-full h-12 rounded-2xl font-bold">
                             Create account
                           </Button>
                         </Link>
                       </div>
                     </div>
                  ) : price > 0 ? (
                     <div ref={payButtonRef}>
                       <StripeCheckoutButton
                          serviceName={selectedService?.name || 'Session'}
                          isLoading={isRedirecting}
                          disabled={!canPay}
                          disabledLabel={
                            !detailsComplete
                              ? "Enter your details, then pick a time slot"
                              : !slotReserved
                                ? "Pick a time slot on the calendar to continue"
                                : undefined
                          }
                          onClick={handlePaymentClick}
                       />
                     </div>
                  ) : (
                     <Button
                        disabled={true}
                        className="w-full h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20"
                     >
                        Free Session — Complete booking on the calendar →
                     </Button>
                  )}
                
                <div className="flex items-center justify-center gap-2 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                   <p className="text-[10px] font-bold">Secured by</p>
                   <span className="font-bold text-xs">Stripe</span>
                </div>
              </div>

              <div className="p-8 bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/10 rounded-3xl">
                <div className="flex gap-4">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg h-fit">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-400 text-sm italic">Automated flow</h4>
                    <p className="text-xs text-blue-800/60 dark:text-blue-400/60 font-medium leading-relaxed mt-1">
                      Pick your time slot first — payment is the last step. Once paid, you will receive an automated confirmation with your Zoom link and preparation notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Calendly Section */}
            <div className="w-full lg:w-[500px] shrink-0">
               <div className="sticky top-32 space-y-6">
                 <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden aspect-[4/5] lg:aspect-auto lg:h-[700px]">
                    <div className="h-16 bg-secondary flex items-center justify-between px-8 border-b border-border">
                       <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                          <Globe size={12} /> Timezone detect: Auto
                       </span>
                       {/* Progress: details → time slot → payment */}
                       <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className={`w-2 h-2 rounded-full ${slotReserved || paymentConfirmed ? 'bg-emerald-500' : 'bg-[#470f0b]/20'}`} />
                          <div className={`w-2 h-2 rounded-full ${paymentConfirmed ? 'bg-emerald-500' : 'bg-[#470f0b]/20'}`} />
                       </div>
                    </div>
                    
                     <div className="relative h-full">
                        {price > 0 && paymentConfirmed ? (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center space-y-4">
                             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <IconBlock icon={CheckCircle2} className="bg-transparent text-emerald-600 p-0" />
                             </div>
                             <p className="text-sm font-bold text-muted-foreground max-w-[240px]">Your session is booked</p>
                             <p className="text-[10px] text-muted-foreground/60 max-w-[220px]">Your time slot and payment are confirmed. Check your email for the details.</p>
                          </div>
                        ) : price > 0 && slotReserved ? (
                          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center space-y-4">
                             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <IconBlock icon={CalendarCheck} className="bg-transparent text-primary p-0" />
                             </div>
                             <p className="text-sm font-bold text-muted-foreground max-w-[240px]">Time slot reserved — complete payment to confirm</p>
                             <p className="text-[10px] text-muted-foreground/60 max-w-[240px]">
                               Calendly has emailed you the slot details. Your booking is confirmed once payment goes through.
                               {reservedSlot?.holdExpiresAt && (
                                 <> We&apos;ll hold this slot until{" "}
                                   <span className="font-bold">
                                     {new Date(reservedSlot.holdExpiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                   </span>; after that it&apos;s released if unpaid.
                                 </>
                               )}
                             </p>
                             <button
                               type="button"
                               onClick={() => setReservedSlot(null)}
                               className="text-[10px] font-bold text-primary underline underline-offset-4"
                             >
                               Pick a different time
                             </button>
                             <p className="text-[10px] text-muted-foreground/50 max-w-[240px]">If you pick again, use the cancel link in your Calendly email to release the earlier slot.</p>
                          </div>
                        ) : (
                          <>
                            <InlineWidget 
                               key={calendlyUrl as string}
                               url={calendlyUrl as string}
                               styles={{ height: '100%', width: '100%' }}
                               prefill={{
                                 email: formData.email,
                                 name: formData.name
                               }}
                            />
                           
                           {/* Blur overlay until the details needed for booking are filled in */}
                           {calendarLocked && (
                             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                   <IconBlock icon={MessageSquare} className="bg-transparent text-primary p-0" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground max-w-[220px]">
                                  {price > 0 && !isAuthenticated
                                    ? "Sign in and enter your details to see availability"
                                    : "Enter your details to reveal availability"}
                                </p>
                                {price > 0 && (
                                  <p className="text-[10px] text-muted-foreground/60 max-w-[220px]">Pick a time that works for you first — payment is the last step.</p>
                                )}
                             </div>
                           )}
                          </>
                        )}
                     </div>
                 </div>
                 
                 <div className="px-6 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground text-center">Available across all African time zones</p>
                    <div className="flex justify-center gap-4 opacity-30 grayscale">
                       <span className="text-[10px] font-bold">WAT</span>
                       <span className="text-[10px] font-bold">CAT</span>
                       <span className="text-[10px] font-bold">EAT</span>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </PublicLayout>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
