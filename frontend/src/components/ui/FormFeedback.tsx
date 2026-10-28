"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

export function FormFeedback({ type, message }: { type: "success" | "error"; message: string }) {
  if (!message) return null;
  const isError = type === "error";
  return <p role={isError ? "alert" : "status"} aria-live={isError ? "assertive" : "polite"} className={`flex items-start gap-2 rounded-xl p-3 text-sm ${isError ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"}`}>
    {isError ? <CircleAlert size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
    <span>{message}</span>
  </p>;
}
