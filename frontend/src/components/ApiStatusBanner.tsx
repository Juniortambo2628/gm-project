"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useSiteData } from "@/context/SiteDataContext";
import { Button } from "@/components/ui/button";

export function ApiStatusBanner() {
  const { error, retryCount, refresh } = useSiteData();

  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-destructive/95 text-destructive-foreground px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <AlertTriangle size={18} className="shrink-0" />
          <p className="text-sm font-medium">
            Unable to load site data: {error}
            {retryCount > 0 && (
              <span className="ml-2 opacity-90">(retrying {retryCount}/{3})</span>
            )}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refresh()}
          className="shrink-0 gap-2"
        >
          <RefreshCcw size={14} />
          Retry now
        </Button>
      </div>
    </div>
  );
}
