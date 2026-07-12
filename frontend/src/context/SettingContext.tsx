"use client";

import { ReactNode } from "react";
import { SiteSettingsProvider, useSiteSettings } from "./SiteSettingsContext";
import { CMSContentProvider, useCMSContent } from "./CMSContentContext";

/**
 * @deprecated Use SiteSettingsProvider and CMSContentProvider directly.
 */
export function SettingProvider({ children }: { children: ReactNode }) {
  return (
    <SiteSettingsProvider>
      <CMSContentProvider>{children}</CMSContentProvider>
    </SiteSettingsProvider>
  );
}

/**
 * @deprecated Use useSiteSettings() instead.
 */
export const useSetting = useSiteSettings;

/**
 * @deprecated Use useCMSContent() instead.
 */
export const useCMS = useCMSContent;
