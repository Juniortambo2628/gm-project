"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface SettingContextType {
  settings: Record<string, any>;
  services: any[];
  testimonials: any[];
  blog_posts: any[];
  faqs: any[];
  isLoading: boolean;
  getSetting: (key: string, defaultValue?: any) => any;
  refreshSettings: () => Promise<void>;
}

const SettingContext = createContext<SettingContextType | undefined>(undefined);

export function SettingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [blog_posts, setBlogPosts] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:8000/api/site-content");
      if (res.data.settings) {
        let loadedSettings = res.data.settings;
        
        // Dynamic absolute URL parser for backend stored media assets
        Object.keys(loadedSettings).forEach(key => {
          const val = loadedSettings[key];
          if (typeof val === 'string' && val.startsWith('/storage/')) {
            loadedSettings[key] = `http://localhost:8000${val}`;
          }
        });

        if (typeof loadedSettings['about_bio_narrative'] === 'string') {
          try {
            loadedSettings['about_bio_narrative'] = JSON.parse(loadedSettings['about_bio_narrative']);
          } catch(e) {}
        }
        setSettings(loadedSettings);
        setServices(res.data.services || []);
        setTestimonials(res.data.testimonials || []);
        setBlogPosts(res.data.blog_posts || []);
        setFaqs(res.data.faqs || []);
      }
    } catch (error) {
      console.error("Failed to fetch site content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const getSetting = (key: string, defaultValue: any = "") => {
    const val = settings[key] !== undefined ? settings[key] : defaultValue;
    if (typeof val === 'string' && val.startsWith('/storage/')) {
      return `http://localhost:8000${val}`;
    }
    return val;
  };

  const refreshSettings = async () => {
    await fetchContent();
  };

  return (
    <SettingContext.Provider value={{ settings, services, testimonials, blog_posts, faqs, isLoading, getSetting, refreshSettings }}>
      {children}
    </SettingContext.Provider>
  );
}

export function useSetting() {
  const context = useContext(SettingContext);
  if (context === undefined) {
    throw new Error("useSetting must be used within a SettingProvider");
  }
  return context;
}

// Alias for convenience
export const useCMS = useSetting;
