"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export function useAdminPaginatedList<T>(url: string, errorMessage = "Could not load records") {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchState] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPageState] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, total: 0 });

  const setSearch = (value: string) => {
    setSearchState(value);
    setPageState(1);
  };
  const setFilter = (key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPageState(1);
  };
  const setPage = (value: number) => setPageState(Math.max(1, value));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string | number> = { page };
    if (search.trim()) params.q = search.trim();
    Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value; });
    try {
      const response = await axiosInstance.get(url, { params });
      setData(Array.isArray(response.data?.data) ? response.data.data : []);
      const pagination = response.data?.meta;
      setMeta({
        current_page: Number(pagination?.current_page ?? page),
        last_page: Number(pagination?.last_page ?? 1),
        total: Number(pagination?.total ?? 0),
      });
    } catch {
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, search, filters, page, errorMessage]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchData(); }, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchData, search]);

  return { data, loading, search, setSearch, filters, setFilter, page, setPage, meta, refetch: fetchData };
}
