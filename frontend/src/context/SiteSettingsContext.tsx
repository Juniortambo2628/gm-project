"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSiteData } from "@/context/SiteDataContext";

interface ImagePosition {
  x: number;
  y: number;
  mobile_x?: number;
  mobile_y?: number;
}

interface HeroPropsResult {
  videoSrc: string;
  mobileVideoSrc?: string;
  position?: ImagePosition;
}

interface SiteSettingsContextType {
  settings: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  getSetting: <T = unknown>(key: string, defaultValue?: T) => T;
  getHeroProps: (bgKey: string, defaultVideoSrc?: string) => HeroPropsResult;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const backendBaseUrl = apiEndpoint.replace(/\/api\/?$/, "");

const normalizeStorageUrl = (val: string): string => {
  if (val.startsWith('/storage/')) {
    return `${backendBaseUrl}${val}`;
  }
  const localPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/storage\//;
  if (localPattern.test(val)) {
    return val.replace(localPattern, `${backendBaseUrl}/storage/`);
  }
  return val;
};

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error, refresh } = useSiteData();

  const settings = useMemo(() => {
    if (!data?.settings) return {};

    const loadedSettings: Record<string, unknown> = { ...data.settings };
    Object.keys(loadedSettings).forEach((key) => {
      const val = loadedSettings[key];
      if (typeof val === 'string') {
        loadedSettings[key] = normalizeStorageUrl(val);
      }
    });

    if (typeof loadedSettings['about_bio_narrative'] === 'string') {
      try {
        loadedSettings['about_bio_narrative'] = JSON.parse(loadedSettings['about_bio_narrative']);
      } catch {
        // Keep raw string if JSON parse fails
      }
    }

    return loadedSettings;
  }, [data]);

  const getSetting = <T = unknown,>(key: string, defaultValue?: T): T => {
    const val = settings[key] !== undefined ? settings[key] : defaultValue;
    if (typeof val === 'string') {
      return normalizeStorageUrl(val) as T;
    }
    return val as T;
  };

  const getHeroProps = (bgKey: string, defaultVideoSrc = "/hero-bg.mp4"): HeroPropsResult => {
    const videoSrc = (settings[bgKey] as string) || defaultVideoSrc;
    const mobileSrc = settings[`${bgKey}_mobile`] as string | undefined;
    const positionStr = settings[`${bgKey}_position`] as string | undefined;

    let position: ImagePosition | undefined;
    if (positionStr) {
      try {
        const parsed = typeof positionStr === "string" ? JSON.parse(positionStr) : positionStr;
        if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
          position = {
            x: parsed.x,
            y: parsed.y,
            mobile_x: parsed.mobile_x,
            mobile_y: parsed.mobile_y,
          };
        }
      } catch {
        // ignore malformed JSON
      }
    }

    return {
      videoSrc,
      mobileVideoSrc: mobileSrc || undefined,
      position,
    };
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, error, getSetting, getHeroProps, refreshSettings: refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
