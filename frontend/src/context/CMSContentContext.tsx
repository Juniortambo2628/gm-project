"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import type { Service, Testimonial, FAQ, BlogPost } from "@/lib/api";

interface CMSContentContextType {
  services: Service[];
  testimonials: Testimonial[];
  faqs: FAQ[];
  blog_posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  refreshCMSContent: () => Promise<void>;
}

const CMSContentContext = createContext<CMSContentContextType | undefined>(undefined);

export function CMSContentProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refresh } = useSiteData();

  const value = useMemo(() => ({
    services: (data?.services || []) as Service[],
    testimonials: (data?.testimonials || []) as Testimonial[],
    faqs: (data?.faqs || []) as FAQ[],
    blog_posts: (data?.blog_posts || []) as BlogPost[],
  }), [data]);

  return (
    <CMSContentContext.Provider value={{ ...value, isLoading, error, refreshCMSContent: refresh }}>
      {children}
    </CMSContentContext.Provider>
  );
}

export function useCMSContent() {
  const context = useContext(CMSContentContext);
  if (context === undefined) {
    throw new Error("useCMSContent must be used within a CMSContentProvider");
  }
  return context;
}
