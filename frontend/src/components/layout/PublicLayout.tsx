"use client";

import { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, PageHeroProps } from "@/components/PageHero";

interface PublicLayoutProps {
  children: ReactNode;
  hero?: Omit<PageHeroProps, "videoSrc"> & { videoSrc?: string };
  className?: string;
}

export function PublicLayout({ children, hero, className = "" }: PublicLayoutProps) {
  return (
    <div className={`min-h-screen bg-background transition-colors duration-500 ${className}`}>
      <SiteHeader />

      {hero && (
        <PageHero
          title={hero.title}
          subtitle={hero.subtitle}
          breadcrumbs={hero.breadcrumbs}
          badge={hero.badge}
          videoSrc={hero.videoSrc}
          mobileVideoSrc={hero.mobileVideoSrc}
          position={hero.position}
          overlayClassName={hero.overlayClassName}
        />
      )}

      {children}

      <SiteFooter />
    </div>
  );
}
