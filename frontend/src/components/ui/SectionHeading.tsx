"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: { label: string; path?: string }[];
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  badge,
  breadcrumbs,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "text-center",
        className
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-xs font-medium", align === "center" && "justify-center")}>
          {breadcrumbs.map((item, i) => (
            <span key={i} className={i === breadcrumbs.length - 1 ? "text-primary font-bold" : "text-muted-foreground/60"}>
              {item.label}
            </span>
          ))}
        </nav>
      )}
      {badge && (
        <Badge variant="default" className="bg-primary/20 backdrop-blur-md border-primary/30 text-primary">
          {badge}
        </Badge>
      )}
      <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
