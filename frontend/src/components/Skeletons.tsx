"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-muted/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-background" />

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10 w-full">
        <div className="max-w-4xl space-y-8">
          {/* Badge */}
          <Skeleton className="h-8 w-40 rounded-full" />
          {/* Breadcrumbs */}
          <div className="flex gap-2">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
          {/* Title */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-12 w-1/2 rounded-xl" />
          </div>
          {/* Subtitle */}
          <div className="space-y-2 border-l-4 border-muted pl-8 py-2">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-4/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="p-8 rounded-3xl border border-border bg-card space-y-6">
      <Skeleton className="h-6 w-3/4 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="p-8 space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialCardSkeleton() {
  return (
    <div className="p-8 rounded-3xl border border-border bg-card space-y-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" />
      ))}
    </div>
  );
}
