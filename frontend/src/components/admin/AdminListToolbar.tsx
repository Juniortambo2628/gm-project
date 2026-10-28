"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdminFilterOption { value: string; label: string; }
export interface AdminFilter { key: string; label: string; options: AdminFilterOption[]; }

export function AdminListToolbar({
  search,
  onSearchChange,
  placeholder = "Search records…",
  filters = [],
  values = {},
  onFilterChange = () => {},
  dateRange = false,
  total,
  page,
  lastPage,
  onPageChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: AdminFilter[];
  values?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  dateRange?: boolean;
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasFilters = filters.length > 0 || dateRange;

  return (
    <section aria-label="Search and filter list" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-xl md:inset-x-auto md:bottom-5 md:left-[calc(20rem+1.5rem)] md:right-6 md:p-4">
      <div className="flex items-end gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="admin-list-search" className="sr-only">Search</label>
          <Search size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input id="admin-list-search" type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        {hasFilters && <Button type="button" variant="outline" className="h-11 shrink-0 gap-2 md:hidden" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal size={16} />Filters</Button>}
        <p className="hidden shrink-0 px-2 text-xs text-muted-foreground md:block" aria-live="polite">{total} matching records</p>
        <nav aria-label="List pages" className="flex shrink-0 items-center gap-1">
          <span className="sr-only" aria-live="polite">Page {page} of {lastPage}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Previous page" onClick={() => onPageChange(page - 1)} disabled={page <= 1}><ChevronLeft size={17} /></Button>
          <span className="min-w-14 text-center text-xs text-muted-foreground" aria-hidden="true">{page} / {lastPage}</span>
          <Button type="button" variant="outline" size="icon" aria-label="Next page" onClick={() => onPageChange(page + 1)} disabled={page >= lastPage}><ChevronRight size={17} /></Button>
        </nav>
      </div>
      {hasFilters && <div className={`${filtersOpen ? "mt-3 grid" : "hidden"} grid-cols-1 gap-2 border-t pt-3 sm:grid-cols-2 md:mt-3 md:grid md:grid-cols-4`}>
        {filters.map((filter) => (
          <div key={filter.key} className="min-w-0">
            <label htmlFor={`admin-filter-${filter.key}`} className="mb-1 block text-xs font-semibold text-muted-foreground">{filter.label}</label>
            <select id={`admin-filter-${filter.key}`} value={values[filter.key] ?? ""} onChange={(event) => onFilterChange(filter.key, event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        ))}
        {dateRange && <>
          <div><label htmlFor="admin-filter-from" className="mb-1 block text-xs font-semibold text-muted-foreground">From</label><input id="admin-filter-from" aria-label="From date" type="date" value={values.from ?? ""} onChange={(event) => onFilterChange("from", event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
          <div><label htmlFor="admin-filter-to" className="mb-1 block text-xs font-semibold text-muted-foreground">To</label><input id="admin-filter-to" aria-label="To date" type="date" value={values.to ?? ""} onChange={(event) => onFilterChange("to", event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
        </>}
        <p className="col-span-full text-xs text-muted-foreground md:hidden" aria-live="polite">{total} matching records</p>
      </div>}
    </section>
  );
}
