"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Globe, Heart, ShieldCheck, Zap, ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { IconBlock } from "@/components/ui/IconBlock";
import { PageHero } from "@/components/PageHero";

export default function AfricaPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const breadcrumbs = [
    { label: "Our Story", path: "/africa" },
    { label: "African context" }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <SiteHeader />

      <PageHero 
        title="Why this matters"
        subtitle="The global stage wasn't designed with the African journey in mind. I'm here to ensure that doesn't stop you from owning it."
        badge="Our common context"
        breadcrumbs={breadcrumbs}
      />

      {/* Core Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-12">
               <div className="relative border-l-8 border-primary pl-8 md:pl-16 py-8 md:py-12 space-y-8 bg-secondary/5 dark:bg-card/20 rounded-r-3xl">
                  <div className="absolute top-8 right-8 opacity-10">
                    <Quote size={150} />
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-bold leading-tight italic max-w-5xl">
                    "Your background isn't a disadvantage. Most coaches just don't know what to do with it."
                  </h2>
                  
                  <div className="space-y-6 text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-4xl">
                     <p>
                        African students bring sharp analytical thinking, real-world experience in complex markets, and stories that no one from a Western university can replicate. 
                     </p>
                     <p className="text-foreground">
                        The problem isn't your profile, it's knowing how to position it. 
                     </p>
                     <p>
                        I've sat where you sit, walked into the same rooms, and won. I coach Africans specifically because I understand your starting point, your strengths, and exactly how to make the people on the other side of that application or interview table take notice.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-20 bg-secondary/5 dark:bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold italic opacity-20">The African advantage</h2>
             <p className="text-xl font-bold">Three reasons why shared context <span className="text-primary italic">wins.</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Shared Identity",
                desc: "I understand the cultural nuances and systemic hurdles that are specific to African education and employment systems."
              },
              {
                icon: ShieldCheck,
                title: "Strategic Defense",
                desc: "I know how to preemptively address common biases by framing your regional achievements as global-level excellence."
              },
              {
                icon: Zap,
                title: "Network Synergy",
                desc: "You join a community of African professionals who are breaking into the same elite spaces, sharing insights and openings."
              }
            ].map((pillar, i) => (
              <div key={i} className="group p-8 bg-background border-2 border-border rounded-2xl hover:border-primary/40 transition-all duration-500 shadow-xl hover:-translate-y-1">
                <IconBlock icon={pillar.icon} className="mb-6" />
                <h3 className="text-xl font-bold mb-3 italic">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Impact Quote */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
           <img 
             src="/portfolio-images/group-seminar-selfie-landscape.png" 
             className="w-full h-full object-cover opacity-20 grayscale" 
             alt="African professionals"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-10">
           <h3 className="text-3xl md:text-6xl font-bold italic leading-none">
             "I believe the next wave of global leaders are coming from <span className="text-primary italic">Lagos, Nairobi, & Johannesburg.</span>"
           </h3>
           <p className="text-xl font-medium text-muted-foreground max-w-3xl mx-auto leading-relaxed italic">
             Our stories are valid. Our ambitions are backed by excellence. My mission is to ensure those doors open for you.
           </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-background">
         <div className="max-w-4xl mx-auto p-10 md:p-16 bg-[#470f0b] text-white rounded-3xl text-center relative overflow-hidden group shadow-2xl">
            <h3 className="text-3xl md:text-5xl font-bold mb-8 italic leading-none">
              Start your <br/><span className="text-white/60">journey today</span>
            </h3>
            <p className="text-lg font-medium mb-10 text-white/80 leading-relaxed max-w-xl mx-auto">
              Ready to turn your background into your greatest asset? Let's talk strategy.
            </p>
            <Link href="/book">
               <Button className="bg-white text-primary hover:bg-white/90 px-16 h-16 text-lg font-bold rounded-full group shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Book a strategy session <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
               </Button>
            </Link>
         </div>
      </section>

      <SiteFooter />
    </div>
  );
}
