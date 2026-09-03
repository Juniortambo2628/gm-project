"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface UseLogoSrcOptions {
  lightKey?: string;
  darkKey?: string;
  lightFallback?: string;
  darkFallback?: string;
}

export function useLogoSrc({
  lightKey = "logo_light",
  darkKey = "logo_dark",
  lightFallback = "/branding/GM-logo-light-final.png",
  darkFallback = "/branding/GM-logo-dark-final.png",
}: UseLogoSrcOptions = {}) {
  const { theme, resolvedTheme } = useTheme();
  const { getSetting } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const currentTheme = mounted ? (resolvedTheme || theme) : "light";
  const logoSrc =
    currentTheme === "dark"
      ? String(getSetting(darkKey, darkFallback))
      : String(getSetting(lightKey, lightFallback));

  return { logoSrc, mounted, currentTheme };
}
