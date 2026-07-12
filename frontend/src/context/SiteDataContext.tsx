"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { getSiteContent, SiteContentResponse } from "@/lib/api";

interface SiteDataContextType {
  data: SiteContentResponse | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  refresh: () => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (attempt = 0) => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await getSiteContent();
      if (isMounted.current) {
        setData(res);
        setRetryCount(0);
      }
    } catch (err) {
      if (!isMounted.current) return;

      if (attempt < MAX_RETRIES) {
        const nextAttempt = attempt + 1;
        setRetryCount(nextAttempt);
        const delay = BASE_DELAY_MS * 2 ** attempt;
        setTimeout(() => {
          if (isMounted.current) {
            fetchData(nextAttempt);
          }
        }, delay);
        return;
      }

      setRetryCount(0);
      setError(err instanceof Error ? err.message : "Unable to reach the server.");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(0);
  }, [fetchData]);

  return (
    <SiteDataContext.Provider value={{ data, isLoading, error, retryCount, refresh }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (context === undefined) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }
  return context;
}
