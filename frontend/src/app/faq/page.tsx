"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CTABanner } from "@/components/CTABanner";
import { useCMSContent } from "@/context/CMSContentContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function FAQPage() {
  const { faqs } = useCMSContent();
  const { getSetting } = useSiteSettings();

  const breadcrumbs = [
    { label: "FAQ" }
  ];

  const faqItems = faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  return (
    <PublicLayout
      hero={{
        title: getSetting('faq_hero_title', "Frequently asked questions"),
        subtitle: getSetting('faq_hero_subtitle', "Everything you need to know about MBA admissions coaching and consulting interview prep."),
        badge: "Help center",
        breadcrumbs,
        videoSrc: getSetting('faq_hero_bg') || "/hero-bg.mp4"
      }}
    >
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Your questions, <span className="text-primary">answered.</span></h2>
        </div>

        <FaqAccordion faqs={faqItems} />
      </main>

      <CTABanner
        title={<>Still have <br/><span className="text-white/60">questions?</span></>}
        description="Book a free discovery call and let's discuss your specific goals."
        buttonText="Book a free call"
        buttonHref="/book"
      />
    </PublicLayout>
  );
}
