"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  name: string;
  duration?: string;
  price: string;
  priceSubtext?: string;
  features: string[];
  ctaText: string;
  ctaLink?: string;
  popular?: boolean;
  className?: string;
}

export function PackageCard({
  name,
  duration,
  price,
  priceSubtext = "Per session",
  features,
  ctaText,
  ctaLink = "/book",
  popular = false,
  className,
}: PackageCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-500 shadow-xl h-full",
        popular
          ? "bg-card border-primary ring-4 ring-primary/5"
          : "bg-background border-border hover:border-primary/40",
        className
      )}
    >
      {popular && (
        <div className="absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-full shadow-lg z-10">
          Most selected
        </div>
      )}

      <div className="flex justify-between items-start mb-8 text-left">
        <div>
          <h3 className="text-xl font-bold mb-1 italic">{name}</h3>
          {duration && (
            <p className="text-xs font-bold text-muted-foreground">{duration}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{price}</p>
          <p className="text-[10px] font-bold opacity-40 uppercase">{priceSubtext}</p>
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-grow text-left">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} />
            <span className="text-sm font-medium text-muted-foreground leading-snug">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Link href={ctaLink}>
          <Button
            className={cn(
              "w-full h-14 rounded-2xl font-bold text-[13px] transition-all",
              popular
                ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]"
                : "bg-secondary text-foreground hover:bg-primary hover:text-white"
            )}
          >
            {ctaText} <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
