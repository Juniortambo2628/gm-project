"use client";

import { Briefcase, Zap, CheckCircle2, Monitor, FileSearch, PieChart, MapPin, BarChart4 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCMSContent } from "@/context/CMSContentContext";
import { IconBlock } from "@/components/ui/IconBlock";
import { PackageCard } from "@/components/ui/PackageCard";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CTABanner } from "@/components/CTABanner";
import { FAQ } from "@/lib/api";
import { HeroSkeleton, ServiceCardSkeleton } from "@/components/Skeletons";

interface FaqItem {
  question: string;
  answer: string;
}

export default function ConsultingPrepPage() {
  const { services, faqs: allFaqs } = useCMSContent();
  const { getSetting, getHeroProps } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Services", path: "/services" },
    { label: "Consulting Prep" }
  ];

  const dynamicConsultingFaqs = allFaqs ? allFaqs.filter((f: FAQ) => f.category === 'consulting' || f.category === 'Consulting Prep') : [];
  const faqs: FaqItem[] = dynamicConsultingFaqs.length > 0
    ? dynamicConsultingFaqs.map((f) => ({ question: f.question, answer: f.answer }))
    : [
        {
          question: "Do you prepare clients for African consulting firms, or only global ones?",
          answer: "Both. I have direct experience at McKinsey Nairobi and Genesis Analytics, Africa&apos;s largest economics consulting firm. I can prepare you for MBB offices across Africa (Nairobi, Lagos, Johannesburg, Casablanca) as well as development consulting firms like Dalberg. Sessions are tailored to the specific firm and office you are targeting."
        },
        {
          question: "I have never done a case interview. Where do I start?",
          answer: "Perfectly fine. Most of my clients start from scratch. I recommend a single introductory session where I assess your level, explain the format, and we can build a personalized plan. No prior experience required."
        },
        {
          question: "Can my African work experience be a strength in consulting interviews?",
          answer: "Absolutely, and most African candidates do not realize this. Experience in markets like Kenya, Nigeria, or Ghana in financial inclusion, agriculture, or infrastructure gives you genuine insight that many candidates from Western universities simply do not have. I will help you frame your African experience as a competitive advantage."
        },
        {
          question: "How many sessions will I need?",
          answer: "Most clients are interview-ready after 3–5 focused sessions, depending on starting point and dedicated independent practice. After your first session, I will give you an honest assessment and recommended plan."
        }
      ];

  const consultingServices = services.filter(s => s.type === 'consulting');

  const packages = [
    ...consultingServices.map(s => ({
      name: s.name,
      duration: s.duration || "60 Min",
      price: `${s.currency === 'USD' ? '$' : ''}${s.price}`,
      features: Array.isArray(s.features) ? s.features : (s.features ? JSON.parse(s.features) : []),
      cta: s.name.toLowerCase().includes('review') ? "Book Review Call" : "Book Mock Interview",
      popular: true
    }))
  ];

  const firms = [
    "McKinsey Africa", "BCG", "Bain & Company", "Dalberg", "Genesis Analytics", "Deloitte Africa", "Oliver Wyman", "PwC Strategy"
  ];

  return (
    <PublicLayout
      hero={{
        title: getSetting('consulting_hero_title', "Consulting preparation for African candidates"),
        subtitle: getSetting('consulting_hero_subtitle', "Coached by a former McKinsey fellow and Genesis Analytics consultant who knows exactly what African offices look for in top-tier talent."),
        badge: "Consulting interview mastery",
        breadcrumbs,
        ...getHeroProps('consulting_hero_bg')
      }}
    >
      {/* Strategy Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    {getSetting('consulting_headline', '') ? (
                      <>{String(getSetting('consulting_headline', '')).split(' ').slice(0, -1).join(' ')} <br/><span className="text-primary italic">{String(getSetting('consulting_headline', '')).split(' ').slice(-1)}</span></>
                    ) : (
                      <>Cracking the case is <br/><span className="text-primary italic">contextual.</span></>
                    )}
                  </h2>
                  <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                    {getSetting('consulting_description', "Generic prep platforms teach you logic. I teach you impact. I help African candidates leverage their unique market knowledge as a decisive advantage in the interview room.")}
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-secondary/20 rounded-2xl border border-border group hover:border-primary/20 transition-all">
                     <IconBlock icon={Zap} className="mb-4 group-hover:scale-110 transition-transform" />
                     <h4 className="text-xl font-bold mb-2">The mock flow</h4>
                     <p className="text-sm font-medium text-muted-foreground">Mock case → Detailed feedback → Personal improvement plan.</p>
                  </div>
                  <div className="p-6 bg-secondary/20 rounded-2xl border border-border group hover:border-primary/20 transition-all">
                     <IconBlock icon={Monitor} className="mb-4 group-hover:scale-110 transition-transform" />
                     <h4 className="text-xl font-bold mb-2">Fit interview</h4>
                     <p className="text-sm font-medium text-muted-foreground">Mastering the PEI (Personal experience interview) and behavioral stories.</p>
                  </div>
               </div>
            </div>

            <div className="bg-primary/[0.03] dark:bg-card border-2 border-primary/10 p-10 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                   <Briefcase size={180} />
                </div>
                
                <h3 className="text-2xl font-bold mb-8 italic border-b border-primary/10 pb-6">Target firms</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {firms.map((firm) => (
                    <div key={firm} className="flex items-center gap-4 group/item">
                       <IconBlock icon={CheckCircle2} className="w-8 h-8 group-hover/item:bg-primary group-hover/item:text-white" />
                       <span className="font-bold text-foreground/80">{firm}</span>
                    </div>
                  ))}
               </div>
               
                <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10 italic text-sm font-medium text-primary/70">
                  &ldquo;Special focus on MBB offices across Nairobi, Lagos, Johannesburg, and Casablanca.&rdquo;
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* African advantage pull-out */}
      <section className="py-20 px-6 relative">
         <div className="max-w-5xl mx-auto p-10 md:p-16 bg-[#470f0b] text-white rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <MapPin size={150} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-8 italic leading-tight relative z-10">
               Leverage your <br/><span className="text-white/50">market intelligence</span>
             </h2>
            <div className="space-y-6 text-xl font-medium text-white/80 leading-relaxed max-w-3xl border-l-4 border-white pl-8 relative z-10">
               <p>
                 African candidates often underplay their greatest asset: ground-level insight.
               </p>
                <p>
                  Whether it&apos;s financial inclusion in Kenya or infrastructure strategy in Nigeria, I help you frame your local experience as a unique competitive advantage that global firms crave.
                </p>
            </div>
         </div>
      </section>

      {/* Pricing and packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16 space-y-4">
             <h2 className="text-4xl md:text-5xl font-bold italic underline underline-offset-[16px] decoration-primary/20">Preparation packages</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Discovery Call Card */}
              <PackageCard 
                name="Discovery Consultation"
                duration={getSetting('discovery_duration', '20 Min')}
                price="FREE"
                priceSubtext="Introductory call"
                features={[
                   "Assess your consulting prep level",
                   "Identify McKinsey & MBB target offices",
                   "Frame your African work experience",
                   "Customized interview roadmap planning"
                ]}
                ctaText="Book Free Discovery Call"
                ctaLink="/book"
                popular={false}
              />

              {packages.map((pkg, i) => (
                <PackageCard 
                  key={i}
                  name={pkg.name}
                  duration={pkg.duration}
                  price={pkg.price}
                  priceSubtext="Fixed rate"
                  features={pkg.features}
                  ctaText={pkg.cta}
                  popular={pkg.popular}
                />
              ))}
          </div>
        </div>
      </section>

      {/* Methodology step-through */}
      <section className="py-20 bg-[#470f0b] text-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
               {[
                 { title: "Mock case", icon: BarChart4, desc: "Realistic simulation based on African market contexts." },
                 { title: "Fit strategy", icon: Zap, desc: "Personalizing your leadership stories for maximum impact." },
                 { title: "Detailed feedback", icon: FileSearch, desc: "Honest scoring on logic, math, and communication." },
                 { title: "Action plan", icon: PieChart, desc: "Concrete steps to bridge gaps before the real things." }
               ].map((step, i) => (
                 <div key={i} className="space-y-6 group">
                    <IconBlock icon={step.icon} className="mx-auto w-20 h-20 rounded-3xl" iconClassName="w-8 h-8" />
                    <h4 className="text-2xl font-bold italic">{step.title}</h4>
                    <p className="text-white/60 font-medium text-sm leading-relaxed">{step.desc}</p>
                 </div>
               ))}
           </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-4xl md:text-5xl font-bold">Consulting <br/><span className="text-primary">FAQ</span></h2>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <CTABanner
        title={<>Land your <br/><span className="text-primary italic">consulting offer.</span></>}
        description="Master the logic, the math, and the narrative. Start your preparation with a coach who knows the African market."
        buttonText="Book first mock case"
        buttonHref="/book"
        variant="card"
      />
    </PublicLayout>
  );
}
