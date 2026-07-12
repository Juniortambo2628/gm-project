"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSiteData } from "@/context/SiteDataContext";

interface ServiceItem {
  id: number;
  name: string;
  type: string;
  duration?: string;
  price: number;
  currency: string;
  features?: string[];
  description?: string;
  is_active?: boolean;
}

interface TestimonialItem {
  id: number;
  client_name: string;
  client_role?: string;
  content: string;
  portrait_path?: string;
  is_featured?: boolean;
  tag?: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image_path?: string;
  published_at?: string;
  status?: string;
}

interface CMSContentContextType {
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  blog_posts: BlogPostItem[];
  isLoading: boolean;
  error: string | null;
  refreshCMSContent: () => Promise<void>;
}

const CMSContentContext = createContext<CMSContentContextType | undefined>(undefined);

export function CMSContentProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refresh } = useSiteData();

  const value = useMemo(() => ({
    services: (data?.services || []) as ServiceItem[],
    testimonials: (data?.testimonials || []) as TestimonialItem[],
    faqs: (data?.faqs || []) as FaqItem[],
    blog_posts: (data?.blog_posts || []) as BlogPostItem[],
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
