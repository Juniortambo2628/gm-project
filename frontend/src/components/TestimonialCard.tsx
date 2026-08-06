"use client";

import { ReactNode } from "react";
import { Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  badge?: { icon?: ReactNode; text: string } | null;
  variant?: "card" | "background";
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  role,
  badge = null,
  variant = "card",
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "group p-8 md:p-10 border-2 border-border rounded-3xl hover:border-primary/40 transition-all duration-500 shadow-xl relative overflow-hidden",
        variant === "card" ? "bg-card" : "bg-background",
        className
      )}
    >
      <Quote className="absolute top-8 right-8 opacity-5 text-primary group-hover:scale-110 transition-transform" size={60} />

      <div className="space-y-6 relative z-10">
        <p className="text-lg font-medium text-foreground leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>

        <div className="pt-6 border-t border-border">
          <p className="font-bold text-primary text-xl">{name}</p>
          <p className="text-sm font-bold text-foreground/80">{role}</p>
          {badge && (
            <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full">
              {badge.icon || <CheckCircle2 size={10} />}
              {badge.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
