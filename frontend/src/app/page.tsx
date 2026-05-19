"use client";

import { useSetting, useCMS } from "@/context/SettingContext";
import { SiteHeader } from "@/components/SiteHeader";
import { PrivacyConsent } from "@/components/PrivacyConsent";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Award, GraduationCap, Briefcase, Globe, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { IconBlock } from "@/components/ui/IconBlock";

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { settings, services, isLoading } = useCMS();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const getOrderedSections = (): string[] => {
    try {
      const val = settings['landing_sections_order_json'];
      if (!val) return ["hero", "bio", "credentials", "african_coach", "cta"];
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["hero", "bio", "credentials", "african_coach", "cta"];
    } catch (e) {
      return ["hero", "bio", "credentials", "african_coach", "cta"];
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <div key="hero" className="relative flex flex-col w-full min-h-[70vh] overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 animate-fade-in transition-opacity duration-700">
               {settings['hero_background_path']?.match(/\.(mp4|webm|ogg)$/i) ? (
                 <video
                   autoPlay
                   loop
                   muted
                   playsInline
                   className="w-full h-full object-cover"
                 >
                   <source src={settings['hero_background_path']} type="video/mp4" />
                 </video>
               ) : (
                 <div 
                   className="absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-center opacity-90 transition-opacity duration-700"
                   style={{ backgroundImage: `url(${settings['hero_background_path'] || '/landing-hero-bg-image-landscape.png'})` }}
                 />
               )}
              
              {/* Theme-adaptive overlays */}
              <div className="absolute inset-0 bg-[#470f0b]/20 transition-colors duration-500" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#470f0b]/10 via-[#470f0b]/20 to-background transition-colors duration-700" />
              
              {/* Animated accent glows */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#470f0b]/10 blur-[120px] rounded-full transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-red-900/10 blur-[100px] rounded-full transition-opacity duration-300" />
            </div>

            {/* Header */}
            <SiteHeader />

            {/* Main Hero Content */}
            <section className="relative z-10 flex-1 flex flex-col justify-center px-5 pt-32 pb-20">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
                {/* Left Column: Transparent Spacer for Visibility */}
                <div className="hidden lg:block lg:col-span-5" />

                {/* Right Column: Hero Content */}
                <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                  <div className="w-fit mx-auto lg:mx-0 min-h-[44px] py-2 px-6 flex items-center justify-center lg:justify-start border border-white/10 bg-primary/10 dark:bg-primary/20 backdrop-blur-md rounded-[20px] md:rounded-full shadow-xl transition-all animate-fade-in shadow-white/5">
                    <span className="text-[11px] sm:text-[13px] font-bold tracking-wider text-white uppercase text-center lg:text-left leading-normal">
                      {settings['hero_tagline'] || "Africa's MBA & Consulting Coach"}
                    </span>
                  </div>
                  
                  <div className="w-full backdrop-blur-md bg-white/5 dark:bg-[#470f0b]/20 rounded-[40px] p-8 md:p-10 border border-white/10 shadow-2xl space-y-8 animate-slide-up relative">
                    {/* Maroon/Pink tint depending on mode */}
                    <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-[40px] pointer-events-none" />
                    
                    <h1 className="relative z-10 text-3xl md:text-5xl font-bold text-white leading-[1.2] transition-all duration-500">
                      {settings['hero_headline'] ? (
                        settings['hero_headline'].split('. ').map((part: string, i: number) => (
                          <span key={i} className="block last:text-white/60">{part}{i === 0 ? '.' : ''}</span>
                        ))
                      ) : (
                        <>
                          <span className="block">Get into Oxford, LBS, or Cambridge.</span>
                          <span className="block text-white/60">Land your consulting offer.</span>
                        </>
                      )}
                    </h1>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
                      <div className="group relative p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-primary/20 transition-all duration-500 shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-3 italic">MBA admissions</h3>
                        <p className="text-sm text-white/80 font-medium leading-relaxed mb-6">
                          {settings['homepage_mba_desc'] || "Targeting Oxford, LBS, or Cambridge? I help you craft an authentic African narrative that resonates with the world's best admissions committees."}
                        </p>
                        <Link href="/services/mba-admissions">
                          <Button variant="outline" className="w-full bg-transparent border-white/40 text-white hover:bg-white hover:text-primary font-bold rounded-full transition-all">
                            Explore MBA Admissions <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>

                      <div className="group relative p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-primary/20 transition-all duration-500 shadow-2xl animate-fade-in">
                        <h3 className="text-xl font-bold text-white mb-3 italic">Consulting prep</h3>
                        <p className="text-sm text-white/80 font-medium leading-relaxed mb-6">
                          {settings['homepage_consulting_desc'] || "MBB case interviews require more than just logic; they require impact-driven confidence. Prep with a former McKinsey fellow who knows the African market."}
                        </p>
                        <Link href="/services/consulting-interviews">
                          <Button variant="outline" className="w-full bg-transparent border-white/40 text-white hover:bg-white hover:text-primary font-bold rounded-full transition-all">
                            Explore Consulting <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'bio':
        return (
          <section key="bio" id="bio" className="relative z-10 py-24 bg-secondary/5 border-y border-border overflow-hidden">
            <div className="max-w-4xl mx-auto px-6">
              <div className="relative border-l-4 border-primary pl-8 md:pl-12 space-y-8 animate-fade-in">
                <h2 className="text-3xl md:text-5xl font-bold leading-tight italic text-foreground">
                  {settings['about_hey_gathoni'] || "Hey, I'm Gathoni."}
                </h2>
                
                <div className="space-y-8 text-xl text-muted-foreground font-medium leading-relaxed">
                  {settings['about_bio_full'] ? (
                    settings['about_bio_full'].split('\n\n').map((para: string, i: number) => {
                      if (para.includes("\"") || para.includes("honesty truth")) {
                        return (
                          <div key={i} className="p-8 md:p-10 bg-card rounded-3xl border border-border shadow-xl transform -rotate-1 my-10 animate-fade-in">
                            <p className="text-foreground italic font-semibold">{para}</p>
                          </div>
                        );
                      }
                      return <p key={i}>{para}</p>;
                    })
                  ) : (
                    <>
                      <p>I'm a Kenyan professional currently completing my Masters in Business Administration (MBA) at Oxford's Saïd Business School. I am one of fewer than 10% of Africans in my cohort, and one of the even smaller number who got here on a full scholarship.</p>
                      <p>Before Oxford, I spent five years in consulting across roughly 15 African countries, advising development finance institutions (DFIs), banks, and NGOs on some of the continent's toughest economic challenges.</p>
                      
                      <div className="p-8 md:p-10 bg-card rounded-3xl border border-border shadow-xl transform -rotate-1 my-10">
                        <p className="text-foreground italic font-semibold">"But here's the honest truth: none of that path was straightforward or obvious when I was where you are now. You're talented. You just need someone in your corner who actually gets it."</p>
                      </div>
                      
                      <p>I've worked at McKinsey & Company's Nairobi office, risen to Senior Associate at Genesis Analytics, and worked at Rogers MacJohn, an impact-driven management consultancy.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'credentials':
        return (
          <section key="credentials" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6 animate-fade-in">
              <div className="text-center mb-16 space-y-4">
                 <h2 className="text-4xl md:text-5xl font-bold italic opacity-20">Credentials</h2>
                 <p className="text-xl font-bold text-foreground">Proof of <span className="text-primary">performance.</span></p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(() => {
                  const defaultCreds = [
                    { icon: GraduationCap, title: "Oxford MBA", subtitle: "Said Business School, Class of 2026", desc: "One of fewer than 10% of Africans in the cohort." },
                    { icon: Award, title: "Laidlaw Scholar", subtitle: "Full Tuition Scholarship", desc: "Selected for 100% merit-based funding for the Oxford MBA." },
                    { icon: Briefcase, title: "McKinsey & Company", subtitle: "Young Leaders Programme Fellow", desc: "Nairobi-based fellowship identifying top African leadership talent." },
                    { icon: TrendingUp, title: "Genesis Analytics", subtitle: "Senior Associate", desc: "Africa's largest economics consulting firm." },
                    { icon: Star, title: "CFA Research Winner", subtitle: "Kenya & East Africa", desc: "Represented East Africa in the regional finals in Dublin, Ireland." },
                    { icon: Globe, title: "Africa Alliance Co-Director", subtitle: "Said Business School", desc: "Leading the East Africa Regionals for the Oxford Africa Business Forum." }
                  ];
                  
                  let creds = defaultCreds;
                  if (settings['credentials_json']) {
                    try {
                      const parsed = JSON.parse(settings['credentials_json']);
                      const iconMap: Record<string, any> = { GraduationCap, Award, Briefcase, TrendingUp, Star, Globe };
                      creds = parsed.map((c: any) => ({
                        ...c,
                        icon: iconMap[c.icon] || Award
                      }));
                    } catch (e) {
                      console.error("Failed to parse credentials_json", e);
                    }
                  }

                  return creds.map((cred, i) => (
                    <div key={i} className="group p-8 bg-card border-2 border-border rounded-2xl hover:border-primary/40 transition-all duration-500 shadow-xl hover:-translate-y-1">
                      <IconBlock icon={cred.icon} className="mb-6" />
                      <h3 className="text-lg font-bold mb-2 text-foreground">{cred.title}</h3>
                      <p className="text-sm font-bold text-primary mb-3">{cred.subtitle}</p>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        {cred.desc}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </section>
        );

      case 'african_coach':
        return (
          <section key="african_coach" className="relative z-10 py-20 bg-background transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                 <div className="lg:col-span-12 xl:col-span-5 relative">
                    <div className="absolute -inset-10 bg-primary/5 rounded-full blur-[100px]" />
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 max-w-sm mx-auto xl:max-w-none aspect-[4/5]">
                      <img 
                        src="/about-professional-portrait-red-bg.png" 
                        alt="Gathoni Mwai" 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                 </div>
                  <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                     <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary">
                       <span className="text-xs font-bold italic">The African advantage</span>
                     </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                      {settings['african_coach_headline'] ? (
                        <>Why an <span className="text-primary italic">{settings['african_coach_headline']}</span></>
                      ) : (
                        <>Why an <span className="text-primary italic">African coach?</span></>
                      )}
                    </h2>

                    <div className="border-l-4 border-primary pl-8 space-y-6">
                       <p className="text-xl font-bold text-foreground leading-snug">
                         {settings['about_tagline'] || "Your background isn't a disadvantage. Most coaches just don't know what to do with it."}
                       </p>
                       <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                         {settings['african_coach_description'] || "African students bring sharp analytical thinking, real-world experience in complex markets, and stories that no one from a Western university can replicate. The problem isn't your profile, it's knowing how to position it."}
                       </p>
                       <p className="text-lg text-muted-foreground font-medium leading-relaxed italic border-t border-border pt-6">
                         "I've sat where you sit, walked into the same rooms, and won. I coach Africans specifically because I understand your starting point."
                       </p>
                    </div>

                     <Link href="#bio" className="inline-block">
                        <Button variant="link" className="p-0 text-primary font-bold text-lg h-auto group">
                           Learn my story <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                     </Link>
                 </div>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key="cta" className="py-20 relative z-10 px-6">
             <div className="max-w-4xl mx-auto rounded-3xl bg-primary text-white p-10 md:p-16 text-center shadow-2xl relative overflow-hidden animate-fade-in">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                 <h3 className="text-3xl md:text-5xl font-bold mb-8 leading-tight italic">
                   Ready to start <br/>your journey?
                 </h3>
                 <p className="text-lg font-medium mb-10 text-white/80">Book a 20-minute discovery call to discuss your goals.</p>
                 <Link href="/book" className="inline-block w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 px-6 sm:px-10 md:px-12 h-12 sm:h-14 text-sm sm:text-base md:text-lg font-bold rounded-full group flex items-center justify-center">
                       Book free discovery call <ArrowRight className="ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform shrink-0" />
                    </Button>
                 </Link>
             </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden antialiased bg-background text-foreground transition-colors duration-300">
      {getOrderedSections().map((sec) => renderSection(sec))}

      <SiteFooter />

      {/* Fixed Chat Icons Overlay */}
      <div className="fixed bottom-0 right-0 p-6 flex flex-col gap-3 z-[60]">
          <a href="https://linkedin.com/in/gathonimwai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
             <IconBlock icon={Linkedin} />
          </a>
      </div>

      <PrivacyConsent />
    </main>
  );
}
