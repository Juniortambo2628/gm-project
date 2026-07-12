"use client";

import { Award, CheckCircle2, Target, Users, Landmark } from "lucide-react";
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

export default function MBAAdmissionsPage() {
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
    { label: "MBA Admissions" }
  ];

  const mbaServices = services.filter(s => s.type === 'mba' && Number(s.price) > 0);

  const dynamicMbaFaqs = allFaqs.filter((f: FAQ) => f.category === 'mba' || f.category === 'MBA Admissions');
  const faqs: FaqItem[] = dynamicMbaFaqs.length > 0
    ? dynamicMbaFaqs.map((f) => ({ question: f.question, answer: f.answer }))
    : [
        {
          question: "I went to a university in Africa. Can I still get into LBS or Oxford?",
          answer: "Absolutely! And this is one of the most important things I help clients with. Top UK business schools actively seek diverse, international profiles. Graduates from many African universities have been admitted to the world&apos;s top MBAs. The key is knowing how to position your profile and tell your story compellingly. I did it from Strathmore University, and I can help you do it too."
        },
        {
          question: "Are there scholarships available for African MBA applicants?",
          answer: "Yes, and this is a major focus of my coaching. As a Laidlaw Foundation Scholar at Oxford (100% tuition funded), I have first-hand experience of the scholarship application process. Key awards include: the Laidlaw Foundation Scholarship, Mastercard AfOx Scholarship, Chevening Scholarships, the Commonwealth Scholarship, and school-specific bursaries at LBS, Oxford, Cambridge, and Imperial. I help clients identify the right scholarships and craft strong applications."
        },
        {
          question: "How do I avoid sounding like every other African MBA applicant?",
          answer: "This is one of the most important and underrated parts of the application. Many African applicants default to the same narrative—the poverty, the resilience, the desire to &apos;give back to Africa&apos;. Admissions committees have read this story thousands of times. I help you dig deeper to find what is genuinely specific, interesting, and authentic about your journey. Your African experience is an asset, but only if you tell it in a way that is yours alone."
        },
        {
          question: "When should I start preparing?",
          answer: "Ideally 9–12 months before your target intake. That said, I have successfully supported clients on shorter timelines. Reach out whenever you are, and we will build the right plan from where you are."
        },
        {
          question: "Which schools do you specialise in?",
          answer: "University of Oxford Said Business School, London Business School (LBS), Cambridge Judge Business School, Imperial College Business School, and Warwick Business School. I will help you decide which schools best match your profile and goals."
        }
      ];
  
  const packages = [
    ...mbaServices.map(s => ({
      name: s.name,
      duration: s.duration || "60 Min",
      price: `${s.currency === 'USD' ? '$' : ''}${s.price}`,
      features: Array.isArray(s.features) ? s.features : (s.features ? JSON.parse(s.features) : []),
      cta: "Book Session",
      popular: true
    }))
  ];

  return (
    <PublicLayout
      hero={{
        title: getSetting('mba_hero_title', "UK MBA admissions coaching for African applicants"),
        subtitle: getSetting('mba_hero_subtitle', "Personalized guidance from someone who got in, on a full scholarship, and understands exactly where you are starting from."),
        badge: "MBA admissions pathway",
        breadcrumbs,
        ...getHeroProps('mba_hero_bg')
      }}
    >
      {/* Narrative & Strategy Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  {getSetting('mba_headline', '') ? (
                    <>{String(getSetting('mba_headline', '')).split(' ').slice(0, -2).join(' ')} <span className="text-primary italic underline underline-offset-8 decoration-primary/20">{String(getSetting('mba_headline', '')).split(' ').slice(-2).join(' ')}</span></>
                  ) : (
                    <>Your African story is <span className="text-primary italic underline underline-offset-8 decoration-primary/20">an asset.</span></>
                  )}
                </h2>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                  {getSetting('mba_description', "But it has to be told right. I help you move beyond the tired narratives admissions readers have seen before and craft something authentic, specific, and compelling.")}
                </p>
              </div>

              <div className="space-y-8">
                 <div className="flex gap-6 items-start">
                    <IconBlock icon={Target} />
                    <div>
                       <h4 className="text-xl font-bold mb-2">Profile evaluation</h4>
                       <p className="text-muted-foreground font-medium">Identify gaps in your background, GMAT/GRE targets, and goals to build a winning school list.</p>
                    </div>
                 </div>
 
                 <div className="flex gap-6 items-start">
                    <IconBlock icon={Users} />
                    <div>
                       <h4 className="text-xl font-bold mb-2">Narrative development</h4>
                       <p className="text-muted-foreground font-medium">Define a coherent post-MBA goal that resonates with top admissions committees and differentiates you.</p>
                    </div>
                 </div>
 
                 <div className="flex gap-6 items-start">
                    <IconBlock icon={Award} />
                    <div>
                       <h4 className="text-xl font-bold mb-2">Recommendation strategy</h4>
                       <p className="text-muted-foreground font-medium">Guidance on who to ask, how to brief them, and ensuring they strengthen—not repeat—your application.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-primary/[0.03] dark:bg-card border-2 border-primary/10 p-10 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                   <Landmark size={180} />
                </div>
                
                <h3 className="text-2xl font-bold mb-8 italic border-b border-primary/10 pb-6 text-foreground">Target schools</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {["London Business School (LBS)", "University of Oxford (Saïd)", "University of Cambridge (Judge)", "Imperial College Business School", "Warwick Business School"].map((school) => (
                    <div key={school} className="flex items-center gap-4 group/item">
                       <IconBlock icon={CheckCircle2} className="w-8 h-8 group-hover/item:bg-primary group-hover/item:text-white" />
                       <span className="font-bold text-foreground/80">{school}</span>
                    </div>
                  ))}
               </div>
               
                <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10 italic text-sm font-medium text-primary/70">
                  &ldquo;Special focus on the UK&apos;s most competitive business schools where my firsthand experience can give you the edge.&rdquo;
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Box (Major Differentiator) */}
      <section className="py-20 bg-background px-6">
         <div className="max-w-5xl mx-auto p-10 md:p-16 bg-[#470f0b] text-white rounded-3xl text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <Award className="mx-auto mb-6 text-white group-hover:scale-110 transition-transform relative z-10" size={48} />
            <h2 className="text-3xl md:text-5xl font-bold mb-8 italic leading-none relative z-10">
              Scholarship focused <br/><span className="text-white/60">African opportunities</span>
            </h2>
            <p className="text-lg font-medium text-white/80 max-w-2xl mx-auto mb-10 relative z-10">
              As a Laidlaw Scholar (100% funding), I prioritize helping African candidates identity and win top-tier scholarships.
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-sm font-bold relative z-10">
               <span>Laidlaw Foundation</span>
               <span>Mastercard AfOx</span>
               <span>Rhodes Scholar</span>
               <span>Commonwealth</span>
            </div>
         </div>
      </section>

      {/* Pricing & Packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-4xl md:text-5xl font-bold italic mb-4">Service packages</h2>
             <p className="text-lg text-muted-foreground font-medium italic">Simple, transparent pricing for premium coaching.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Discovery Call Card */}
              <PackageCard 
                name="Discovery Consultation"
                duration={getSetting('discovery_duration', '20 Min')}
                price="FREE"
                priceSubtext="Introductory call"
                features={[
                   "Evaluate your GMAT/GRE status",
                   "Identify target top-tier UK schools",
                   "Identify African scholarship eligibility",
                   "Review career narrative starting point"
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

      {/* Process Flow */}
      <section className="py-20 bg-secondary/5 dark:bg-card/20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 opacity-10">The methodology</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-20">
               {[
                 { step: "01", label: "Profile Evaluation" },
                 { step: "02", label: "Career Narrative" },
                 { step: "03", label: "Essays & CV" },
                 { step: "04", label: "Interview Prep" },
                 { step: "05", label: "Application" }
               ].map((item, i) => (
                 <div key={i} className="group flex flex-col items-center relative">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mb-6 group-hover:border-primary group-hover:text-primary transition-all shadow-xl">
                       <span className="text-xl font-bold italic">{item.step}</span>
                    </div>
                    <p className="text-sm font-bold max-w-[120px]">{item.label}</p>
                    {i !== 4 && <div className="hidden md:block absolute right-0 top-8 translate-x-1/2 w-4 h-[2px] bg-border" />}
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-4xl md:text-5xl font-bold">MBA admissions <br/><span className="text-primary">FAQ</span></h2>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Final CTA */}
      <CTABanner
        title={<>Ready to win <br/><span className="text-white/60">your place?</span></>}
        description="Don't leave your application to chance. Book a strategy session today and start your journey to a world-class MBA."
        buttonText="Start my strategy"
        buttonHref="/book"
      />
    </PublicLayout>
  );
}
