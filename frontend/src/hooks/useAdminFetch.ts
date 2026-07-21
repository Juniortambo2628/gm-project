"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { extractList } from "@/lib/api";
import { toast } from "sonner";
import { AxiosRequestConfig } from "axios";

interface UseAdminFetchOptions<T> {
  /** When true, the fetch is skipped (e.g. while auth is loading). */
  enabled?: boolean;
  /** If true, response is unwrapped with extractList<T>(). Otherwise raw response is returned. */
  extractAsList?: boolean;
  /** Custom error message shown in toast on failure. */
  errorMessage?: string;
  /** Extra Axios config merged into the request. */
  axiosConfig?: AxiosRequestConfig;
  /** Called after a successful fetch with the resolved data. */
  onSuccess?: (data: T) => void;
}

interface UseAdminFetchResult<T> {
  data: T;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for admin page data fetching.
 *
 * Wraps the repeated `useEffect` + `useState` + `axiosInstance` + `extractList`
 * pattern into a single declarative call.
 *
 * @example
 * // List endpoint (extracts array from paginated response)
 * const { data, loading, refetch } = useAdminFetch<Booking[]>("/cms/orders");
 *
 * @example
 * // Raw response — skip extractList
 * const { data, loading } = useAdminFetch<DashboardSummary>("/cms/dashboard", {
 *   extractAsList: false,
 * });
 *
 * @example
 * // Conditionally fetch
 * const { data } = useAdminFetch<User[]>("/cms/users", { enabled: isAuthenticated });
 */
export function useAdminFetch<T>(
  url: string,
  options: UseAdminFetchOptions<T> = {}
): UseAdminFetchResult<T> {
  const {
    enabled = true,
    extractAsList = true,
    errorMessage = "Failed to load data",
    axiosConfig,
    onSuccess,
  } = options;

  const [data, setData] = useState<T>((extractAsList ? [] : undefined) as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(url, axiosConfig);
      const result = (extractAsList ? extractList<T>(res) : res.data) as T;
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, enabled, extractAsList, errorMessage, axiosConfig, onSuccess]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
