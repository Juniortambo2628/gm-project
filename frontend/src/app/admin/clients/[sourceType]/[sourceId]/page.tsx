"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CreditCard, Download, FileText, Loader2, Mail, MessageSquare, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";

interface ClientDetail {
  client: { name: string; email: string; account: { role: string; created_at: string; deleted_at?: string | null } | null };
  payments: Array<{ id: number; status: string; amount: string | number; currency: string; service_name?: string; created_at: string; appointment?: { status: string; scheduled_at: string } | null }>;
  inquiries: Array<{ id: number; subject?: string; content: string; is_read: boolean; created_at: string }>;
  appointments: Array<{ id: number; status: string; scheduled_at: string; service?: { name: string }; documents?: Array<{ id: number; name: string; size_bytes: number }> }>;
  emails: Array<{ id: number; template_key: string; subject: string; status: string; error_message?: string; created_at: string }>;
}

export default function ClientRecordPage() {
  const params = useParams<{ sourceType: string; sourceId: string }>();
  const [record, setRecord] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    axiosInstance.get(`/cms/clients/${params.sourceType}/${params.sourceId}`)
      .then((response) => setRecord(response.data))
      .catch(() => toast.error("Could not load this client record"))
      .finally(() => setLoading(false));
  }, [params.sourceType, params.sourceId]);

  const download = async (id: number, filename: string) => {
    setDownloading(id);
    try {
      const response = await axiosInstance.get(`/cms/appointment-documents/${id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { toast.error("Could not download document"); }
    finally { setDownloading(null); }
  };

  const client = record?.client;
  return (
    <AdminListPage title={client?.name ?? "Client record"} description={client?.email ?? "Combined client activity"} isLoading={loading}>
      <Link href="/admin/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"><ArrowLeft size={16} /> Back to client records</Link>
      {client && <>
        <Card className="rounded-2xl border shadow-sm"><CardContent className="flex flex-wrap items-center gap-4 p-5"><UserRound className="text-primary" /><div className="min-w-0"><p className="font-bold">{client.name}</p><p className="text-sm text-muted-foreground">{client.email}</p></div><span className="ml-auto rounded-full bg-muted px-3 py-1 text-xs capitalize">{client.account?.deleted_at ? "Account deactivated" : client.account?.role ?? "No account"}</span></CardContent></Card>
        <Card className="rounded-2xl border shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard size={18} /> Payments and bookings</CardTitle></CardHeader><CardContent className="space-y-3">{record.payments.length ? record.payments.map((payment) => <div key={payment.id} className="rounded-xl bg-muted/30 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold">{payment.service_name ?? "Service"} · {payment.currency} {Number(payment.amount).toLocaleString()}</p><span className="text-sm capitalize">Payment: {payment.status}</span></div><p className="mt-1 text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleString()} · Appointment: {payment.appointment?.status ?? "not linked"}{payment.appointment?.scheduled_at ? ` · ${new Date(payment.appointment.scheduled_at).toLocaleString()}` : ""}</p></div>) : <p className="text-sm text-muted-foreground">No payments recorded.</p>}</CardContent></Card>
        <Card className="rounded-2xl border shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CalendarDays size={18} /> Appointments and shared documents</CardTitle></CardHeader><CardContent className="space-y-3">{record.appointments.length ? record.appointments.map((appointment) => <div key={appointment.id} className="rounded-xl bg-muted/30 p-4"><p className="font-semibold">{appointment.service?.name ?? "Appointment"} · <span className="capitalize">{appointment.status}</span></p><p className="text-sm text-muted-foreground">{new Date(appointment.scheduled_at).toLocaleString()}</p><ul className="mt-3 space-y-2">{appointment.documents?.map((file) => <li key={file.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2"><span className="flex items-center gap-2 text-sm"><FileText size={15} />{file.name}<span className="text-xs text-muted-foreground">{(file.size_bytes / 1048576).toFixed(1)} MB</span></span><Button size="sm" variant="outline" disabled={downloading === file.id} onClick={() => download(file.id, file.name)}>{downloading === file.id ? <Loader2 className="animate-spin" /> : <Download />} Download</Button></li>)}</ul></div>) : <p className="text-sm text-muted-foreground">No appointments recorded.</p>}</CardContent></Card>
        <Card className="rounded-2xl border shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare size={18} /> Inquiries</CardTitle></CardHeader><CardContent className="space-y-3">{record.inquiries.length ? record.inquiries.map((inquiry) => <div key={inquiry.id} className="rounded-xl bg-muted/30 p-4"><div className="flex justify-between gap-2"><p className="font-semibold">{inquiry.subject || "General inquiry"}</p><span className="text-xs capitalize text-muted-foreground">{inquiry.is_read ? "Read" : "Unread"}</span></div><p className="mt-2 whitespace-pre-wrap text-sm">{inquiry.content}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleString()}</p></div>) : <p className="text-sm text-muted-foreground">No inquiries recorded.</p>}</CardContent></Card>
        <Card className="rounded-2xl border shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Mail size={18} /> Email history</CardTitle></CardHeader><CardContent className="space-y-2">{record.emails.length ? record.emails.map((email) => <div key={email.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-muted/30 p-4"><div><p className="font-semibold">{email.subject}</p><p className="text-xs text-muted-foreground">{email.template_key} · {new Date(email.created_at).toLocaleString()}</p>{email.error_message && <p className="mt-1 text-xs text-destructive">{email.error_message}</p>}</div><span className="h-fit rounded-full bg-background px-3 py-1 text-xs capitalize">{email.status}</span></div>) : <p className="text-sm text-muted-foreground">No emails recorded.</p>}</CardContent></Card>
      </>}
      {!loading && !record && <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">We could not locate this client record.</p>}
    </AdminListPage>
  );
}
