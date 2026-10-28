"use client";

import { History, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminPaginatedList } from "@/hooks/useAdminPaginatedList";

interface AuditEvent { id: number; user_id: number; admin_name?: string; action: string; subject_type?: string; subject_id?: string; status_code: number; ip_address?: string; created_at: string; }

export default function AuditTrailPage() {
  const { data, loading, search, setSearch, page, setPage, meta } = useAdminPaginatedList<AuditEvent>("/cms/audit-logs", "Could not load the admin audit trail");

  return <AdminListPage title="Admin Audit Trail" description="A history of successful administrative changes and private document downloads." isLoading={loading}>
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground"><ShieldCheck className="mr-2 inline text-amber-600" size={17} />Audit records include the acting administrator, route, outcome, and source IP. Request contents and client documents are never stored in the audit event.</div>
    <AdminListToolbar search={search} onSearchChange={setSearch} placeholder="Search actions or record references" total={meta.total} page={page} lastPage={meta.last_page} onPageChange={setPage} />
    <div className="space-y-3">{data.map((event) => <Card key={event.id} className="rounded-2xl border shadow-sm"><CardContent className="flex flex-wrap items-start justify-between gap-4 p-5"><div className="min-w-0"><p className="flex items-center gap-2 font-semibold"><History size={16} className="text-primary" />{event.action}</p><p className="mt-1 text-sm text-muted-foreground">{event.admin_name ?? `Admin #${event.user_id}`} · {event.subject_type ?? "record"} {event.subject_id ?? ""} · HTTP {event.status_code}</p></div><div className="text-right text-xs text-muted-foreground"><p>{new Date(event.created_at).toLocaleString()}</p><p>{event.ip_address ?? "IP unavailable"}</p></div></CardContent></Card>)}{!loading && data.length === 0 && <EmptyState icon={<History size={28} />} title="No audit events match your search" />}</div>
  </AdminListPage>;
}
