"use client";

import React from "react";
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { IconBlock } from "@/components/ui/IconBlock";

export default function UserGuidePage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction to consultancy",
      icon: BookOpen,
      content: "This consultancy is a strategic partner designed to help African professionals access global opportunities. By providing real-time insights into admissions frameworks and career trajectories, we empower you to make data-driven decisions that foster personal growth and success."
    },
    {
      id: "getting-started",
      title: "Getting started",
      icon: Zap,
      content: "To begin, book a strategy session through our portal. Once confirmed, you will be directed to your personalized dashboard where you can see your upcoming sessions, recently shared resources, and progress tracking."
    },
    {
      id: "surveys",
      title: "Participating in sessions",
      icon: CheckCircle2,
      content: "Sessions are the heart of our consultancy. When a session is booked, it will appear on your dashboard. These interactions are designed to be intensive and impactful. Your active participation is critical for success."
    },
    {
      id: "anonymity",
      title: "Privacy and confidentiality",
      icon: ShieldCheck,
      content: "We take your privacy seriously. All client data and session details are strictly confidential. No information is ever shared with third parties without your explicit consent."
    },
    {
      id: "analytics",
      title: "Understanding insights",
      icon: BarChart3,
      content: "Clients have access to tailored insights, including admissions probability and career mapping. These visualizations help identify areas of strength and opportunities for improvement in your professional profile."
    },
    {
      id: "support",
      title: "Support and help",
      icon: HelpCircle,
      content: "If you encounter any technical issues or have questions about a specific session, please reach out to our team or use the help center link in your sidebar."
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground transition-colors antialiased">
      <SiteHeader />

      <PageHero 
        title="Mastering your strategy"
        subtitle="Welcome to the official consultancy guide. Whether you are preparing for an MBA application or a career shift, this guide provide everything you need to succeed."
        badge="Latest session update"
        breadcrumbs={[
          { label: "Resources", path: "/guide" },
          { label: "User guide" }
        ]}
      />

      <main className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <div className="space-y-1">
              <p className="px-4 text-[13px] font-bold text-muted-foreground mb-4 opacity-50">Documentation topics</p>
              {sections.map(section => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-card hover:shadow-sm text-muted-foreground hover:text-primary font-bold text-sm transition-all"
                >
                  <section.icon size={18} className="opacity-70" />
                  {section.title}
                </a>
              ))}
            </div>

            <div className="mt-12 p-6 bg-primary rounded-[32px] text-primary-foreground shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                    <h4 className="text-lg mb-2 font-bold">Need live help?</h4>
                    <p className="text-xs text-primary-foreground/70 mb-6 font-bold leading-relaxed">Our support team is available to assist you with your journey.</p>
                    <button className="w-full h-11 bg-primary-foreground text-primary rounded-xl text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 font-bold">
                        Chat support
                    </button>
                </div>
               <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            </div>
          </aside>

          {/* Content area */}
          <div className="lg:col-span-9 space-y-20 pt-10">
             <div className="space-y-32">
               {sections.map(section => (
                 <section key={section.id} id={section.id} className="scroll-mt-32">
                   <div className="flex items-center gap-4 mb-8">
                     <IconBlock icon={section.icon} />
                     <h2 className="text-3xl text-foreground font-bold">{section.title}</h2>
                   </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6 text-muted-foreground transition-colors">
                      <p className="text-lg leading-relaxed font-medium">
                        {section.content}
                      </p>
                      <ul className="space-y-3">
                        {["Enterprise compliance", "ISO 27001 Certified", "GDPR Compliant"].map((item, i) => (
                           <li key={i} className="flex items-center gap-3 text-[13px] font-medium underline opacity-60">
                               <CheckCircle2 size={16} className="text-emerald-500" />
                               {item}
                           </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-secondary/30 rounded-[40px] aspect-video flex items-center justify-center border-4 border-card shadow-inner overflow-hidden group transition-colors">
                        <section.icon size={64} className="text-muted-foreground/20 transition-transform group-hover:scale-110 duration-700" />
                    </div>
                  </div>
                </section>
              ))}
            </div>

             <div className="bg-[#470f0b] rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl transition-colors duration-300">
                 <div className="relative z-10 max-w-2xl text-center mx-auto">
                     <h2 className="text-4xl md:text-5xl mb-6 leading-tight font-bold">Ready to transform your <span className="text-primary italic">career?</span></h2>
                     <p className="text-lg text-white/60 mb-10 leading-relaxed font-bold">
                         Join over 5,000 professionals using our consultancy to build world-class portfolios.
                     </p>
                     <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                         <Link href="/book">
                             <Button className="w-full sm:w-auto h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-sm shadow-xl transition-transform hover:-translate-y-1">
                                 Get started now
                             </Button>
                         </Link>
                         <Button variant="outline" className="w-full sm:w-auto h-14 px-10 border-white/20 text-white hover:bg-white hover:text-primary rounded-full font-bold text-sm transition-all">
                             Book a session
                         </Button>
                     </div>
                </div>
                <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-[#3edec7]/10 rounded-full blur-[120px]"></div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
