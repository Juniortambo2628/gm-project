"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Briefcase, MapPin, Phone, MessageSquare, CheckCircle2, Globe, Loader2, PhoneCall } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCMSContent } from "@/context/CMSContentContext";
import { IconBlock } from "@/components/ui/IconBlock";
import dynamic from "next/dynamic";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { africanCountries } from "@/lib/data/countries";
import { createTransaction, verifyPayment } from "@/lib/api";
import { toast } from "sonner";

const PaystackButton = dynamic(() => import("@/components/PaystackButton"), { 
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

// Map service type to icons
const serviceIconMap: Record<string, any> = {
  mba: GraduationCap,
  consulting: Briefcase,
  discovery: PhoneCall,
};

export default function BookingPage() {
  const { services } = useCMSContent();
  const { getSetting, getHeroProps } = useSiteSettings();
  const [mounted, setMounted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    expectations: ""
  });

  useEffect(() => {
    setMounted(true);
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];
  const price = selectedService?.price || 0;

  // Resolve the correct Calendly URL for the selected service
  const calendlySettingKey = selectedService
    ? (calendlySettingKeyMap[selectedService.type] || 'discovery_calendly_url')
    : 'discovery_calendly_url';
  const calendlyUrl = getSetting(calendlySettingKey) || "https://calendly.com/gathoni-mwai0/gm-discovery-call";

  useEffect(() => {
    const handleCalendlyEvent = async (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled' && price === 0) {
        const inviteeUri = e.data.payload.invitee.uri;
        
        setIsRecording(true);
        try {
          await createTransaction({
            name: formData.name,
            email: formData.email,
            amount: 0,
            currency: selectedService?.currency || 'USD',
            service_id: selectedService?.id,
            paystack_ref: `calendly_${inviteeUri.split('/').pop()}`,
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
          setIsRecording(false);
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, [formData, price, selectedService]);

  if (!mounted) return null;
  
  const canPay = !!(formData.email && formData.name && formData.phone);

  const breadcrumbs = [
    { label: "Booking", path: "/book" },
    { label: "Strategy session" }
  ];

  const handlePaymentSuccess = async (reference: { reference: string }) => {
    setIsRecording(true);
    try {
      // Step 1: Verify payment server-side with Paystack API
      const verification = await verifyPayment(reference.reference);
      if (!verification.verified) {
        toast.error("Verification failed", {
          description: verification.message || "Could not verify payment. Please contact support.",
        });
        return;
      }

      // Step 2: Record the verified transaction
      await createTransaction({
        name: verification.data?.customer_name || formData.name,
        email: verification.data?.customer_email || formData.email,
        amount: verification.data?.amount || price,
        currency: verification.data?.currency || selectedService?.currency || 'USD',
        service_id: selectedService?.id,
        paystack_ref: reference.reference,
        status: 'success'
      });

      toast.success("Payment successful!", {
        description: "Your session is now confirmed. Check your email for details."
      });
      setFormData({ name: "", email: "", phone: "", location: "", expectations: "" });
    } catch {
      toast.error("Recording issue", {
        description: "Payment succeeded but we couldn't record the transaction. Please contact support."
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handlePaymentClose = () => {
    toast.error("Payment cancelled", {
      description: "The payment process was not completed."
    });
  };

  return (
    <PublicLayout
      hero={{
        title: getSetting('book_hero_title', "Secure your session"),
        subtitle: getSetting('book_hero_subtitle', "Choose your pathway and book a time that works for you. Payments are processed securely via Paystack."),
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
              {/* Service Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {services.map((s) => {
                  const ServiceIcon = serviceIconMap[s.type] || Briefcase;
                  return (
                    <button 
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 h-full ${selectedServiceId === s.id ? 'bg-primary/5 border-primary ring-4 ring-primary/5' : 'bg-card border-border hover:border-primary/20'}`}
                    >
                      <IconBlock icon={ServiceIcon} className={selectedServiceId === s.id ? 'bg-primary text-white' : 'bg-secondary text-primary'} />
                      <div>
                        <p className="font-bold italic">{s.name}</p>
                        <p className="text-2xl font-bold text-primary">
                          {s.price === 0 ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            <>
                              {s.currency === 'KES' ? 'KSh ' : '$'}{Number(s.price).toLocaleString()} 
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
                            <option value="">Select Region</option>
                            {africanCountries.map(c => <option key={c} value={c}>{c}</option>)}
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

                  {price > 0 ? (
                     <PaystackButton 
                        email={formData.email}
                        amountInCents={price * 100}
                        serviceName={selectedService?.name || 'Session'}
                        isRecording={isRecording}
                        disabled={!canPay}
                        onSuccess={handlePaymentSuccess}
                        onClose={handlePaymentClose}
                     />
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
                   <span className="font-bold text-xs">Paystack</span>
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
                      After successful payment, you will receive an automated confirmation with your Zoom link and preparation notes.
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
                       <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="w-2 h-2 rounded-full bg-[#470f0b]/20" />
                          <div className="w-2 h-2 rounded-full bg-[#470f0b]/20" />
                       </div>
                    </div>
                    
                     <div className="relative h-full">
                        <InlineWidget 
                           key={calendlyUrl as string}
                           url={calendlyUrl as string}
                           styles={{ height: '100%', width: '100%' }}
                           prefill={{
                             email: formData.email,
                             name: formData.name
                           }}
                        />
                       
                       {/* Blur Overlay if form not filled */}
                       {(!formData.name || !formData.email) && (
                         <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                               <IconBlock icon={MessageSquare} className="bg-transparent text-primary p-0" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground max-w-[200px]">Enter your details to reveal availability</p>
                         </div>
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
