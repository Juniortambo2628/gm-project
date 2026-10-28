"use client";

import { useState } from "react";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { useAdminPaginatedList } from "@/hooks/useAdminPaginatedList";
import { AdminListControls, AdminPagination } from "@/components/admin/AdminListControls";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import Link from "next/link";

interface AppointmentDocument { id: number; name: string; size_bytes: number; created_at: string; }
interface Appointment { id: number; client_name: string; client_email: string; scheduled_at: string; status: string; service?: { name: string }; transaction?: { status: string }; documents?: AppointmentDocument[]; }

export default function AdminAppointmentsPage() {
  const { data: appointments, loading, search, setSearch, filters, setFilter, page, setPage, meta, refetch } = useAdminPaginatedList<Appointment>("/cms/appointments", "Could not load appointments");
  const [downloading, setDownloading] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentDocument | null>(null);

  const download = async (document: AppointmentDocument) => {
    setDownloading(document.id);
    try {
      const response = await axiosInstance.get(`/cms/appointment-documents/${document.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Could not download this document");
    } finally {
      setDownloading(null);
    }
  };

  const deleteDocument = async () => {
    if (!deleteTarget) return;
    try {
      await axiosInstance.delete(`/cms/appointment-documents/${deleteTarget.id}`);
      toast.success("Document deleted");
      refetch();
    } catch {
      toast.error("Could not delete this document");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AdminListPage title="Appointments & Documents" description="Review client appointments and securely download their shared documents." isLoading={loading}>
      <AdminListControls search={search} onSearchChange={setSearch} placeholder="Search by client name or email" filters={[{ key: "status", label: "Appointment", options: [{ value: "", label: "All statuses" }, { value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }] }, { key: "documents", label: "Documents", options: [{ value: "", label: "All appointments" }, { value: "uploaded", label: "Has documents" }, { value: "missing", label: "No documents" }] }]} values={filters} onFilterChange={setFilter} dateRange total={meta.total} />
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="rounded-2xl border shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{appointment.client_name}</h2>
                  <p className="text-sm text-muted-foreground">{appointment.client_email} · {appointment.service?.name ?? "Appointment"}</p>
                  <Link href={`/admin/clients/appointment/${appointment.id}`} className="mt-1 inline-flex text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Open client history</Link>
                </div>
                <div className="text-right text-sm"><p>{new Date(appointment.scheduled_at).toLocaleString()}</p><p className="capitalize text-muted-foreground">Appointment: {appointment.status}</p><p className="capitalize text-muted-foreground">Payment: {appointment.transaction?.status ?? "Unknown"}</p></div>
              </div>
              <div className="border-t pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Client documents ({appointment.documents?.length ?? 0})</p>
                {appointment.documents?.length ? <ul className="space-y-2">{appointment.documents.map((document) => (
                  <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
                    <span className="min-w-0"><span className="flex items-center gap-2 truncate text-sm"><FileText size={16} className="shrink-0 text-primary" />{document.name}</span><span className="text-xs text-muted-foreground">{(document.size_bytes / 1024 / 1024).toFixed(1)} MB · {new Date(document.created_at).toLocaleDateString()}</span></span>
                    <div className="flex gap-2"><Button size="sm" variant="outline" disabled={downloading === document.id} onClick={() => download(document)}>{downloading === document.id ? <Loader2 className="animate-spin" /> : <Download />} Download</Button><Button size="sm" variant="ghost" aria-label={`Delete ${document.name}`} onClick={() => setDeleteTarget(document)}><Trash2 /></Button></div>
                  </li>
                ))}</ul> : <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && appointments.length === 0 && <EmptyState icon={<FileText size={30} />} title="No appointments found" description="Appointments and client documents will appear here." />}
      </div>
      <AdminPagination page={page} lastPage={meta.last_page} onPageChange={setPage} />
      <ConfirmDeleteDialog isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={deleteDocument} title="Delete client document" description={deleteTarget ? `Permanently delete ${deleteTarget.name}? This cannot be undone.` : "This cannot be undone."} />
    </AdminListPage>
  );
}
