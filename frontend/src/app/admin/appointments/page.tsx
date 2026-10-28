"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";

interface AppointmentDocument { id: number; name: string; size_bytes: number; created_at: string; }
interface Appointment { id: number; client_name: string; client_email: string; scheduled_at: string; status: string; service?: { name: string }; documents?: AppointmentDocument[]; }

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    axiosInstance.get("/cms/appointments")
      .then((response) => setAppointments(Array.isArray(response.data?.data) ? response.data.data : []))
      .catch(() => toast.error("Could not load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const download = async (document: AppointmentDocument) => {
    setDownloading(document.id);
    try {
      const response = await axiosInstance.get(`/cms/appointment-documents/${document.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download this document");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AdminListPage title="Appointments & Documents" description="Review client appointments and securely download their shared documents." isLoading={loading}>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="rounded-2xl border shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{appointment.client_name}</h2>
                  <p className="text-sm text-muted-foreground">{appointment.client_email} · {appointment.service?.name ?? "Appointment"}</p>
                </div>
                <div className="text-right text-sm"><p>{new Date(appointment.scheduled_at).toLocaleString()}</p><p className="capitalize text-muted-foreground">{appointment.status}</p></div>
              </div>
              <div className="border-t pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Client documents ({appointment.documents?.length ?? 0})</p>
                {appointment.documents?.length ? <ul className="space-y-2">{appointment.documents.map((document) => (
                  <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 truncate text-sm"><FileText size={16} className="shrink-0 text-primary" />{document.name}</span>
                    <Button size="sm" variant="outline" disabled={downloading === document.id} onClick={() => download(document)}>
                      {downloading === document.id ? <Loader2 className="animate-spin" /> : <Download />} Download
                    </Button>
                  </li>
                ))}</ul> : <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && appointments.length === 0 && <EmptyState icon={<FileText size={30} />} title="No appointments found" description="Appointments and client documents will appear here." />}
      </div>
    </AdminListPage>
  );
}
