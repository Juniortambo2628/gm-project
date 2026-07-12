"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    gaLoaded?: boolean;
  }
}

export function SEOHandler() {
  const { settings, getSetting } = useSiteSettings();
  const initialized = useRef(false);

  useEffect(() => {
    const metaTitle = getSetting('meta_title', '');
    const metaDescription = getSetting('meta_description', '');
    const favicon = getSetting('favicon', '');

    if (metaTitle) {
      document.title = String(metaTitle);
    }
    if (metaDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', String(metaDescription));
      } else {
        const meta = document.createElement('meta');
        meta.name = "description";
        meta.content = String(metaDescription);
        document.head.appendChild(meta);
      }
    }
    if (favicon && !initialized.current) {
      const faviconEl = document.querySelector('link[rel="icon"]');
      if (faviconEl) {
        faviconEl.setAttribute('href', String(favicon));
      } else {
        const link = document.createElement('link');
        link.rel = "icon";
        link.href = String(favicon);
        document.head.appendChild(link);
      }
    }

    if (!initialized.current) {
      initialized.current = true;
    }
  }, [settings, getSetting]);

  return null;
}
