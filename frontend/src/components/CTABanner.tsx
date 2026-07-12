"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTABannerProps {
  title: React.ReactNode;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  className?: string;
  variant?: "maroon" | "card";
}

export function CTABanner({
  title,
  description,
  buttonText = "Book a session",
  buttonHref = "/book",
  onButtonClick,
  className,
  variant = "maroon",
}: CTABannerProps) {
  const isMaroon = variant === "maroon";

  const content = (
    <div
      className={cn(
        "max-w-4xl mx-auto p-12 md:p-20 rounded-3xl text-center relative overflow-hidden group shadow-2xl",
        isMaroon ? "bg-primary text-white" : "bg-card border-2 border-primary/20 text-foreground",
        className
      )}
    >
      {!isMaroon && (
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      )}
      <h3 className="text-4xl md:text-5xl font-bold mb-8 italic leading-none relative z-10">
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-lg font-medium mb-10 leading-relaxed max-w-xl mx-auto relative z-10",
            isMaroon ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
      {onButtonClick ? (
        <Button
          onClick={onButtonClick}
          className={cn(
            "w-full sm:w-auto px-6 sm:px-10 md:px-12 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-bold rounded-full group shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative z-10",
            isMaroon
              ? "bg-white text-primary hover:bg-white/90"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {buttonText} <ArrowRight className="ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform shrink-0" />
        </Button>
      ) : (
        <Link href={buttonHref} className="inline-block w-full sm:w-auto relative z-10">
          <Button
            className={cn(
              "w-full sm:w-auto px-6 sm:px-10 md:px-12 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-bold rounded-full group shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center",
              isMaroon
                ? "bg-white text-primary hover:bg-white/90"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {buttonText} <ArrowRight className="ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform shrink-0" />
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <section className="py-20 px-6">
      {content}
    </section>
  );
}
