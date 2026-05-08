"use client";

import { useCMS } from "@/context/SettingContext";
import { useEffect } from "react";

export function SEOHandler() {
  const { settings } = useCMS();

  useEffect(() => {
    if (settings['meta_title']) {
      document.title = settings['meta_title'];
    }
    if (settings['meta_description']) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', settings['meta_description']);
      } else {
        const meta = document.createElement('meta');
        meta.name = "description";
        meta.content = settings['meta_description'];
        document.head.appendChild(meta);
      }
    }
    if (settings['favicon']) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.setAttribute('href', settings['favicon']);
      } else {
        const link = document.createElement('link');
        link.rel = "icon";
        link.href = settings['favicon'];
        document.head.appendChild(link);
      }
    }

    if (window && !(window as any).gaLoaded) {
       console.log("GA4 Initialized for: ", settings['meta_title'] || "Gathoni Mwai");
       (window as any).gaLoaded = true;
    }
  }, [settings]);

  return null;
}
