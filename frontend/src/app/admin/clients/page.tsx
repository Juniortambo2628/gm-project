"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAdminPaginatedList } from "@/hooks/useAdminPaginatedList";

interface ClientRecord {
  name: string;
  email: string;
  last_activity: string;
  activity_count: number;
  source_type: string;
  source_id: number;
}

export default function AdminClientsPage() {
  const { data, loading, search, setSearch, page, setPage, meta } = useAdminPaginatedList<ClientRecord>("/cms/clients", "Could not load client records");

  return (
    <AdminListPage title="Client Records" description="A combined view of client accounts, bookings, inquiries, and email history." isLoading={loading}>
      <AdminListToolbar search={search} onSearchChange={setSearch} placeholder="Search clients by name or email" total={meta.total} page={page} lastPage={meta.last_page} onPageChange={setPage} />
      <div className="space-y-3">
        {data.map((client) => <Card key={`${client.source_type}-${client.source_id}`} className="rounded-2xl border shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound size={19} /></div>
              <div className="min-w-0"><h2 className="truncate font-bold">{client.name}</h2><p className="truncate text-sm text-muted-foreground">{client.email}</p><p className="mt-1 text-xs text-muted-foreground">Last activity {new Date(client.last_activity).toLocaleDateString()} · {client.activity_count} records</p></div>
            </div>
            <Link href={`/admin/clients/${client.source_type}/${client.source_id}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open client record <ArrowRight size={15} /></Link>
          </CardContent>
        </Card>)}
        {!loading && data.length === 0 && <EmptyState icon={<BriefcaseBusiness size={28} />} title="No client records found" description="Try another name or email, or check back after client activity." />}
      </div>
    </AdminListPage>
  );
}
