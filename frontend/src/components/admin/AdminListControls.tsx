"use client";

import { Search } from "lucide-react";

export interface AdminFilterOption { value: string; label: string; }
export interface AdminFilter { key: string; label: string; options: AdminFilterOption[]; }

export function AdminListControls({
  search,
  onSearchChange,
  placeholder = "Search records…",
  filters = [],
  values = {},
  onFilterChange,
  dateRange = false,
  total,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: AdminFilter[];
  values?: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  dateRange?: boolean;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="admin-list-search" className="mb-1 block text-xs font-semibold text-muted-foreground">Search</label>
          <Search size={16} aria-hidden="true" className="absolute left-3 top-[2.45rem] text-muted-foreground" />
          <input id="admin-list-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-40">
            <label htmlFor={`admin-filter-${filter.key}`} className="mb-1 block text-xs font-semibold text-muted-foreground">{filter.label}</label>
            <select id={`admin-filter-${filter.key}`} value={values[filter.key] ?? ""} onChange={(event) => onFilterChange(filter.key, event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        ))}
        {dateRange && <>
          <div><label htmlFor="admin-filter-from" className="mb-1 block text-xs font-semibold text-muted-foreground">From</label><input id="admin-filter-from" aria-label="From date" type="date" value={values.from ?? ""} onChange={(event) => onFilterChange("from", event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div><label htmlFor="admin-filter-to" className="mb-1 block text-xs font-semibold text-muted-foreground">To</label><input id="admin-filter-to" aria-label="To date" type="date" value={values.to ?? ""} onChange={(event) => onFilterChange("to", event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
        </>}
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">{total} matching records</p>
    </div>
  );
}

export function AdminPagination({ page, lastPage, onPageChange }: { page: number; lastPage: number; onPageChange: (page: number) => void }) {
  return (
    <nav aria-label="List pages" className="flex items-center justify-between gap-4 pt-2">
      <p className="text-sm text-muted-foreground" aria-live="polite">Page {page} of {lastPage}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="min-h-10 rounded-lg border px-3 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Previous</button>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= lastPage} className="min-h-10 rounded-lg border px-3 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">Next</button>
      </div>
    </nav>
  );
}
