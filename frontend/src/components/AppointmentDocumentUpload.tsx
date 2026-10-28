"use client";

import { useCallback, useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { FileText, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";

export default function AppointmentDocumentUpload({
  appointmentId,
  expires,
  signature,
}: {
  appointmentId: string;
  expires: string;
  signature: string;
}) {
  const [documents, setDocuments] = useState<Array<{ id: number; name: string; size_bytes: number }>>([]);
  const [limit, setLimit] = useState(10);
  const [checkingLink, setCheckingLink] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [linkExpired, setLinkExpired] = useState(false);

  const signedQuery = `expires=${encodeURIComponent(expires)}&signature=${encodeURIComponent(signature)}`;

  const refreshDocuments = useCallback(async () => {
    const response = await axiosInstance.get(`/appointments/${appointmentId}/documents?${signedQuery}`);
    setDocuments(response.data.documents ?? []);
    setLimit(Number(response.data.limit ?? 10));
  }, [appointmentId, signedQuery]);

  useEffect(() => {
    if (!expires || !signature) {
      setLinkExpired(true);
      setCheckingLink(false);
      return;
    }
    refreshDocuments()
      .catch((failure: unknown) => { const status = (failure as { response?: { status?: number } })?.response?.status; const invalidLink = status === 403 || status === 404; setLinkExpired(invalidLink); setError(invalidLink ? "This upload link has expired or is no longer valid." : "We could not verify the upload link. Check your connection and try again."); })
      .finally(() => setCheckingLink(false));
  }, [appointmentId, expires, signature, refreshDocuments]);

  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length > 5) {
      setFiles([]);
      setError(`You selected ${selected.length} files. Choose up to 5 files per upload.`);
      return;
    }
    if (documents.length + selected.length > limit) {
      setFiles([]);
      setError(`You can upload ${Math.max(0, limit - documents.length)} more file(s) for this appointment.`);
      return;
    }
    const invalid = selected.find((file) => file.size > 10 * 1024 * 1024 || !/\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name));
    if (invalid) {
      setFiles([]);
      setError(invalid.size > 10 * 1024 * 1024 ? `${invalid.name} is over the 10 MB file limit.` : `${invalid.name} has an unsupported file type.`);
      return;
    }
    setError("");
    setMessage("");
    setFiles(selected);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!files.length) return setError("Choose at least one document to upload.");

    const body = new FormData();
    files.forEach((file) => body.append("documents[]", file));
    setLoading(true);
    try {
      await axiosInstance.post(`/appointments/${appointmentId}/documents?${signedQuery}`, body, {
        onUploadProgress: (event) => setProgress(event.total ? Math.round((event.loaded / event.total) * 100) : 0),
      });
      setMessage(`${files.length} document${files.length === 1 ? " was" : "s were"} securely attached to your appointment.`);
      setFiles([]);
      setProgress(100);
      await refreshDocuments();
    } catch (uploadError: unknown) {
      const failure = uploadError as { response?: { status?: number; data?: { message?: string } } };
      const responseMessage = failure?.response?.data?.message;
      const expired = failure?.response?.status === 403 || failure?.response?.status === 404 || Boolean(responseMessage && (responseMessage.toLowerCase().includes("signature") || responseMessage.toLowerCase().includes("expired")));
      setLinkExpired(expired);
      setError(responseMessage || (expired ? "This upload link has expired or is no longer valid." : "The upload could not be completed. Check your connection and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/20 px-5 py-16 flex items-center justify-center">
      <Card className="w-full max-w-xl rounded-3xl shadow-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText size={26} /></div>
          <CardTitle className="text-2xl">Share documents for your appointment</CardTitle>
        <CardDescription>PDF, Word documents, and JPG or PNG images are accepted, up to 10 MB each. You can upload five at a time, up to ten files total.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <label htmlFor="appointment-documents" className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:border-primary/50 focus-within:ring-2 focus-within:ring-ring">
              <UploadCloud className="text-primary" size={28} />
              <span className="text-sm font-semibold">Choose documents from your device</span>
              <span className="text-xs text-muted-foreground">{checkingLink ? "Checking secure link…" : `${Math.max(0, limit - documents.length)} upload slot(s) remaining`}</span>
              <input id="appointment-documents" type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={selectFiles} disabled={linkExpired || documents.length >= limit} aria-describedby="upload-limits" />
            </label>
            <p id="upload-limits" className="text-xs text-muted-foreground">Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG. Maximum 10 MB per file.</p>
            {files.length > 0 && <ul className="space-y-2 text-sm">{files.map((file) => <li key={`${file.name}-${file.size}`} className="truncate rounded-lg bg-muted px-3 py-2">{file.name}</li>)}</ul>}
            {loading && <div aria-live="polite"><div className="mb-1 flex justify-between text-xs"><span>Uploading</span><span>{progress}%</span></div><div role="progressbar" aria-label="Document upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></div>}
            {message && <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} />{message}</p>}
            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={loading || checkingLink || linkExpired || !files.length || documents.length >= limit}>
              {loading ? <><Loader2 className="mr-2 animate-spin" />Uploading…</> : "Upload documents"}
            </Button>
            {documents.length > 0 && <div className="space-y-2 border-t pt-4"><p className="text-sm font-semibold">Received documents ({documents.length}/{limit})</p>{documents.map((document) => <p key={document.id} className="truncate text-xs text-muted-foreground">{document.name} · {(document.size_bytes / 1048576).toFixed(1)} MB</p>)}</div>}
            {linkExpired && <p className="text-center text-sm text-muted-foreground">To request a fresh link, <Link href="/login?redirect=%2Fuser" className="font-semibold text-primary underline">sign in and open your booking details</Link>. If you don&apos;t have an account, contact us for help.</p>}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
