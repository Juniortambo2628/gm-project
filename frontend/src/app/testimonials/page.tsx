"use client";

import { Star, GraduationCap, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCMSContent } from "@/context/CMSContentContext";
import { IconBlock } from "@/components/ui/IconBlock";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CTABanner } from "@/components/CTABanner";
import { TestimonialCard } from "@/components/TestimonialCard";

interface Testimonial {
  name?: string;
  client_name?: string;
  outcome?: string;
  client_role?: string;
  quote?: string;
  content?: string;
  scholarship?: string;
  award?: string;
  firm?: string;
  tag?: string;
}

export default function TestimonialsPage() {
  const { testimonials } = useCMSContent();
  const { getSetting, getHeroProps } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (!mounted) return null;

  const breadcrumbs = [
    { label: "Our Impact", path: "/testimonials" },
    { label: "Testimonials" }
  ];

  const allTestimonials = testimonials as Testimonial[];
  const dynamicMBA = allTestimonials.filter((t) => t.tag === 'MBA Admissions');
  const dynamicConsulting = allTestimonials.filter((t) => t.tag === 'Consulting Prep');

  const mbaStories: Testimonial[] = dynamicMBA.length > 0 ? dynamicMBA : [
    {
       name: "K. Mutua",
       outcome: "Oxford Saïd MBA",
       scholarship: "Mastercard Foundation AfOx Scholar",
       quote: "Gathoni didn't just help me with my essays; she helped me find my voice as an African professional. Her understanding of how to frame regional impact for a global committee was the difference maker.",
       tag: "MBA Admissions"
    },
    {
       name: "A. Okonkwo",
       outcome: "London Business School (LBS)",
       scholarship: "Merit-based Award",
       quote: "I thought my background in Nigerian fintech was too 'niche' for LBS. Gathoni showed me how to turn that technical experience into a strategic narrative that resonated with the admissions team.",
       tag: "MBA Admissions"
    },
    {
       name: "J. Mwangi",
       outcome: "Cambridge Judge Business School",
       scholarship: "Full Scholarship",
       quote: "The mock interviews were grueling but exactly what I needed. By the time I walked into the real interview, I had already answered every difficult question three times with Gathoni.",
       tag: "MBA Admissions"
    }
  ];

  const consultingStories: Testimonial[] = dynamicConsulting.length > 0 ? dynamicConsulting : [
    {
       name: "S. Abdi",
       outcome: "McKinsey Africa",
       firm: "Nairobi Office",
       quote: "Cracking cases was one thing, but mastering the 'Fit' interview with someone who actually worked at McKinsey was what gave me the confidence to land the offer.",
       tag: "Consulting Prep"
    },
    {
       name: "M. Tadesse",
       outcome: "Genesis Analytics",
       firm: "Johannesburg Office",
       quote: "The focus on African market dynamics during our mock cases was invaluable. I wasn't just solving a math problem; I was solving an African economic problem.",
       tag: "Consulting Prep"
    },
    {
       name: "O. Bello",
       outcome: "Bain & Company",
       firm: "Lagos Office",
       quote: "Her resume review turned my bullet points into impact statements. I went from zero visibility to three interview invites in the same month.",
       tag: "Consulting Prep"
    }
  ];

  return (
    <PublicLayout
      hero={{
        title: getSetting('testimonials_hero_title', "Our clients win"),
        subtitle: getSetting('testimonials_hero_subtitle', "From Nairobi to Oxford, Lagos to London. Meet the African professionals who turned their ambitions into reality."),
        badge: "Success stories",
        breadcrumbs,
        ...getHeroProps('testimonials_hero_bg')
      }}
    >
      {/* MBA Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-12 px-6">
             <IconBlock icon={GraduationCap} />
             <div>
                <h2 className="text-2xl md:text-4xl font-bold italic">MBA admissions</h2>
                <p className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Targeting global excellence</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mbaStories.map((story, i) => (
              <TestimonialCard
                key={i}
                quote={story.quote || story.content || ""}
                name={story.name || story.client_name || ""}
                role={story.outcome || story.client_role || ""}
                badge={
                  story.scholarship || story.award
                    ? { text: story.scholarship || story.award || "" }
                    : null
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Consulting Success Stories */}
      <section className="py-20 bg-secondary/5 dark:bg-card/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-12 px-6">
             <IconBlock icon={Briefcase} />
             <div>
                <h2 className="text-2xl md:text-4xl font-bold italic">Consulting preparation</h2>
                <p className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Landing the opportunity</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {consultingStories.map((story, i) => (
              <TestimonialCard
                key={i}
                quote={story.quote || story.content || ""}
                name={story.name || story.client_name || ""}
                role={story.outcome || story.client_role || ""}
                badge={
                  story.firm
                    ? { text: story.firm }
                    : null
                }
                variant="background"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Success Multiplier Section */}
      <section className="py-20 px-6">
         <div className="max-w-5xl mx-auto p-12 md:p-20 bg-[#470f0b] text-white rounded-3xl text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
               <Star size={240} />
            </div>
            
            <h3 className="text-3xl md:text-5xl font-bold mb-8 italic leading-none relative z-10">
              {getSetting('testimonials_success_headline', "90% Success rate for Africans")}
            </h3>
            <p className="text-lg font-medium mb-10 text-white/80 leading-relaxed max-w-2xl mx-auto border-y border-white/10 py-8 relative z-10">
              {getSetting('testimonials_success_description', "When you have a coach who understands your context, your success becomes predictable, not lucky.")}
            </p>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {[
                  { label: "UK MBAs", val: "Oxford, LBS" },
                  { label: "Scholarships", val: "Full funding" },
                  { label: "Consulting", val: "McKinsey, BCG" },
                  { label: "Regions", val: "Global impact" }
                ].map((stat, i) => (
                  <div key={i}>
                     <p className="text-xl font-bold">{stat.val}</p>
                     <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
             </div>
         </div>
      </section>

      {/* CTA Section */}
      <CTABanner
        title={<>Ready to write your <br/><span className="text-white/60">success story?</span></>}
        description="Don't wait for the 'perfect' time. Start your preparation today and join our list of winners."
        buttonText="Book a strategy session"
        buttonHref="/book"
      />
    </PublicLayout>
  );
}
