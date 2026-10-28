"use client";

import { Mail, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminPaginatedList } from "@/hooks/useAdminPaginatedList";

interface EmailLog { id: number; recipient: string; template_key: string; subject: string; status: string; error_message?: string; created_at: string; }

export default function EmailLogsPage() {
  const { data, loading, search, setSearch, filters, setFilter, page, setPage, meta } = useAdminPaginatedList<EmailLog>("/cms/mail-logs", "Could not load email delivery history");

  return <AdminListPage title="Email Delivery Log" description="Review delivery attempts and identify messages that need attention." isLoading={loading}>
    <AdminListToolbar search={search} onSearchChange={setSearch} placeholder="Search recipients or subject" filters={[{ key: "status", label: "Delivery status", options: [{ value: "", label: "All statuses" }, { value: "failed", label: "Failed" }, { value: "sent", label: "Sent" }, { value: "queued", label: "Queued" }, { value: "sending", label: "Sending" }] }]} values={filters} onFilterChange={setFilter} dateRange total={meta.total} page={page} lastPage={meta.last_page} onPageChange={setPage} />
    <div className="space-y-3">{data.map((email) => <Card key={email.id} className="rounded-2xl border shadow-sm"><CardContent className="flex flex-wrap items-start justify-between gap-4 p-5"><div className="min-w-0"><p className="flex items-center gap-2 font-semibold"><Mail size={16} className="shrink-0 text-primary" />{email.subject}</p><p className="mt-1 text-sm text-muted-foreground">{email.recipient} · {email.template_key}</p>{email.error_message && <p className="mt-2 flex gap-2 text-sm text-destructive"><AlertTriangle size={15} className="shrink-0" />{email.error_message}</p>}</div><div className="text-right text-sm"><span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{email.status}</span><p className="mt-2 text-xs text-muted-foreground">{new Date(email.created_at).toLocaleString()}</p></div></CardContent></Card>)}{!loading && data.length === 0 && <EmptyState icon={<Mail size={28} />} title="No email records match these filters" />}</div>
  </AdminListPage>;
}
