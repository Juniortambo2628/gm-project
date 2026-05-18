"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle" | "card" | "table-row";
}

export function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/60 dark:bg-muted/20 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        {
          "h-4 w-full rounded-md": variant === "text",
          "rounded-2xl": variant === "rect",
          "rounded-full": variant === "circle",
          "p-6 rounded-2xl border border-white/5 space-y-4": variant === "card",
          "h-16 w-full rounded-xl flex items-center px-6 gap-4": variant === "table-row",
        },
        className
      )}
      {...props}
    >
      {variant === "card" && (
        <>
          <div className="h-6 w-1/3 bg-muted/80 dark:bg-muted/30 rounded-md animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted dark:bg-muted/20 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 bg-muted dark:bg-muted/20 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-muted/80 dark:bg-muted/30 rounded-xl animate-pulse" />
        </>
      )}
      {variant === "table-row" && (
        <>
          <div className="h-8 w-8 bg-muted/80 dark:bg-muted/30 rounded-full animate-pulse flex-shrink-0" />
          <div className="h-4 w-1/4 bg-muted dark:bg-muted/20 rounded-md animate-pulse" />
          <div className="h-4 w-1/3 bg-muted dark:bg-muted/20 rounded-md animate-pulse" />
          <div className="h-4 w-1/6 bg-muted dark:bg-muted/20 rounded-md animate-pulse ml-auto" />
        </>
      )}
    </div>
  );
}

export function SkeletonList({ count = 3, variant = "table-row", className }: { count?: number; variant?: "text" | "rect" | "circle" | "card" | "table-row"; className?: string }) {
  return (
    <div className={cn("space-y-4 w-full", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
