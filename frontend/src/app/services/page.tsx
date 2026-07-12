"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBlock } from "@/components/ui/IconBlock";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCMSContent } from "@/context/CMSContentContext";

export default function ServicesPage() {
  const { services } = useCMSContent();

  const breadcrumbs = [
    { label: "Services" }
  ];

  return (
    <PublicLayout
      hero={{
        title: "Coaching services",
        subtitle: "Personalized guidance for MBA admissions and consulting interviews, built for African professionals.",
        badge: "What we offer",
        breadcrumbs,
        videoSrc: "/hero-bg.mp4"
      }}
    >
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <Link href="/services/mba-admissions" className="group">
            <div className="h-full p-10 md:p-14 bg-card border-2 border-border rounded-3xl hover:border-primary/30 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <IconBlock icon={GraduationCap} className="mb-6 w-16 h-16 text-primary bg-primary/10" />
              <h2 className="text-3xl font-bold mb-4">MBA Admissions</h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                UK MBA admissions coaching for African applicants. Profile evaluation, narrative development, essay strategy, and scholarship positioning.
              </p>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold text-[11px]">
                Explore MBA admissions <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </Link>

          <Link href="/services/consulting-interviews" className="group">
            <div className="h-full p-10 md:p-14 bg-card border-2 border-border rounded-3xl hover:border-primary/30 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              <IconBlock icon={Briefcase} className="mb-6 w-16 h-16 text-primary bg-primary/10" />
              <h2 className="text-3xl font-bold mb-4">Consulting Interviews</h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                Case interview and fit preparation for MBB and top-tier consulting firms across Africa and globally.
              </p>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold text-[11px]">
                Explore consulting prep <ArrowRight size={14} className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">All service packages</h2>
          <div className="space-y-4">
            {services.length > 0 ? services.map((service) => (
              <div key={service.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card border border-border rounded-2xl hover:border-primary/20 transition-all">
                <div>
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{service.type === 'mba' ? 'MBA Admissions' : 'Consulting Prep'}</p>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                  <p className="text-xl font-bold text-primary">
                    {service.currency === 'USD' ? '$' : ''}{service.price}
                  </p>
                  <Link href="/book">
                    <Button size="sm" className="rounded-xl font-bold text-xs">
                      Book now
                    </Button>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground font-medium italic border border-dashed rounded-3xl">
                No services configured yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
