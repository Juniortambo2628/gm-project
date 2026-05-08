"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  badge?: string;
  videoSrc?: string;
  overlayClassName?: string;
}

export function PageHero({ 
  title, 
  subtitle, 
  breadcrumbs, 
  badge, 
  videoSrc = "/hero-bg.mp4",
  overlayClassName 
}: PageHeroProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden border-b border-border">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {videoSrc.match(/\.(mp4|webm|ogg)$/i) ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={videoSrc} 
            alt={title} 
            className="w-full h-full object-cover opacity-90"
          />
        )}
        
        {/* Dynamic Gradient Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background transition-colors duration-700",
          overlayClassName
        )} />
        
        {/* Subtle noise/texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 w-full">
        <div className="max-w-4xl space-y-8 animate-slide-up">
          {/* 1. Badge (Pill-shaped, no icons) */}
          {badge && (
            <Badge variant="default" className="bg-primary/20 backdrop-blur-md border-primary/30 text-primary-foreground dark:text-primary px-6 py-2">
              {badge}
            </Badge>
          )}

          {/* 2. Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} className="opacity-80" />
          
          {/* 3. Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
            {title.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-[0.2em]">
                {word}
              </span>
            ))}
          </h1>
          
          {/* 4. Subtitle/Description */}
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-2xl border-l-4 border-primary/30 pl-8 py-2 italic animate-fade-in transition-all">
             {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
