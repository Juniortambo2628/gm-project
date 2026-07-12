"use client";

import { useSiteData } from "@/context/SiteDataContext";
import { LogoLoader } from "@/components/LogoLoader";

export function SiteDataGate({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useSiteData();

  if (isLoading) {
    return <LogoLoader />;
  }

  if (error) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
