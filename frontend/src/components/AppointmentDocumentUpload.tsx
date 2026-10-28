"use client";

import { useState, type FormEvent } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
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
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!files.length) return setError("Choose at least one document to upload.");

    const body = new FormData();
    files.forEach((file) => body.append("documents[]", file));
    setLoading(true);
    try {
      await axiosInstance.post(`/appointments/${appointmentId}/documents?expires=${encodeURIComponent(expires)}&signature=${encodeURIComponent(signature)}`, body);
      setMessage("Your documents were uploaded securely. Thank you.");
      setFiles([]);
    } catch (uploadError: unknown) {
      const responseMessage = (uploadError as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(responseMessage || "The upload link may have expired. Please contact us for a new link.");
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
          <CardDescription>Upload up to five files at a time. PDF, Word documents, and JPG or PNG images are accepted, up to 10 MB each.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center hover:border-primary/50">
              <UploadCloud className="text-primary" size={28} />
              <span className="text-sm font-semibold">Choose documents from your device</span>
              <span className="text-xs text-muted-foreground">Maximum 5 files per upload, 10 files per appointment</span>
              <input type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))} />
            </label>
            {files.length > 0 && <ul className="space-y-2 text-sm">{files.map((file) => <li key={`${file.name}-${file.size}`} className="truncate rounded-lg bg-muted px-3 py-2">{file.name}</li>)}</ul>}
            {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
            {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={loading || !expires || !signature}>
              {loading ? <><Loader2 className="mr-2 animate-spin" />Uploading…</> : "Upload documents"}
            </Button>
            {(!expires || !signature) && <p className="text-center text-xs text-destructive">This upload link is invalid. Please contact us for a new one.</p>}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
