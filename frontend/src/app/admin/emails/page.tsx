"use client";

import React, { useState } from "react";
import { Mail, Eye, RotateCcw, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { RichHtmlEditor } from "@/components/RichHtmlEditor";
import {
  getMailTemplates,
  updateMailTemplate,
  previewMailTemplate,
  resetMailTemplate,
  type MailTemplate,
  type MailTemplatePreview,
  getErrorMessage,
} from "@/lib/api";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
  useAdminFetch<MailTemplate[]>(
    "" as string,
    {
      extractAsList: false,
      errorMessage: "Failed to load email templates",
      onSuccess: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          selectTemplate(data[0]);
        }
      },
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fetched, setFetched] = useState(false);
  const [templateList, setTemplateList] = useState<MailTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setTemplateLoading(true);
        const data = await getMailTemplates();
        if (!cancelled) {
          setTemplateList(data);
          setTemplateLoading(false);
          if (data.length > 0) {
            setSelectedKey(data[0].key);
            setSubject(data[0].subject);
            setBody(data[0].body);
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load email templates", { description: getErrorMessage(err) });
          setTemplateLoading(false);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<MailTemplatePreview | null>(null);

  const selected = templateList.find((t) => t.key === selectedKey);

  const selectTemplate = (template: MailTemplate) => {
    setSelectedKey(template.key);
    setSubject(template.subject);
    setBody(template.body);
    setPreview(null);
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    try {
      await updateMailTemplate(selectedKey, { subject, body });
      setTemplateList((prev) =>
        prev.map((t) => (t.key === selectedKey ? { ...t, subject, body } : t))
      );
      toast.success("Template saved", { icon: <CheckCircle2 size={16} /> });
    } catch (err) {
      toast.error("Failed to save template", { description: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedKey) return;
    try {
      const data = await previewMailTemplate(selectedKey);
      setPreview(data);
      setPreviewOpen(true);
    } catch (err) {
      toast.error("Failed to generate preview", { description: getErrorMessage(err) });
    }
  };

  const handleReset = async () => {
    if (!selectedKey) return;
    if (!confirm("Reset this template to its default content?")) return;
    try {
      const template = await resetMailTemplate(selectedKey);
      setTemplateList((prev) =>
        prev.map((t) => (t.key === selectedKey ? template : t))
      );
      setSubject(template.subject);
      setBody(template.body);
      toast.success("Template reset to default");
    } catch (err) {
      toast.error("Failed to reset template", { description: getErrorMessage(err) });
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setBody((prev) => (prev ? `${prev} ${placeholder}` : placeholder));
  };

  return (
    <AdminListPage
      title="Email Templates"
      description="Customize automated emails, preview them with sample data, and manage dynamic placeholders."
      isLoading={templateLoading}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-2xl border shadow-sm p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">
              Templates
            </h3>
            <div className="space-y-2">
              {templateList.map((template) => (
                <button
                  key={template.key}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    selectedKey === template.key
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-transparent hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${selectedKey === template.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${selectedKey === template.key ? "text-primary" : "text-foreground"}`}>
                        {template.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate">
                        {template.description || template.subject}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-8 space-y-6">
          {selected && (
            <>
              <Card className="rounded-2xl border shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-foreground">{selected.name}</h2>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{selected.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreview} className="rounded-lg font-bold">
                      <Eye size={15} className="mr-2" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReset} className="rounded-lg font-bold">
                      <RotateCcw size={15} className="mr-2" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-lg font-bold">
                      {saving ? <RotateCcw className="animate-spin mr-2" size={15} /> : <Save size={15} className="mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Subject Line</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Email Body</label>
                  <RichHtmlEditor
                    value={body}
                    onChange={setBody}
                    placeholder="Compose the email body using the toolbar..."
                    className="rounded-xl"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center bg-card p-4 rounded-xl border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Available Placeholders:</span>
                  {selected.variables && selected.variables.length > 0 ? (
                    selected.variables.map((variable) => (
                      <button
                        key={variable}
                        onClick={() => insertPlaceholder(variable)}
                        title="Insert placeholder"
                        className="text-[10px] font-extrabold text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/10 font-mono transition-colors"
                      >
                        {variable}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No placeholders for this template.</span>
                  )}
                </div>
              </Card>

              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Email Automation</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Changes are applied immediately after saving. Automated emails for payments, bookings, reminders, and follow-ups use these templates.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={preview?.subject || "Preview"}
        description="Rendered with sample placeholder values and your configured logo."
        maxWidth="4xl"
      >
        <div className="space-y-4">
          {preview?.html ? (
            <div
              className="border rounded-xl overflow-hidden bg-white"
              dangerouslySetInnerHTML={{ __html: preview.html }}
            />
          ) : (
            <p className="text-muted-foreground">Loading preview...</p>
          )}
        </div>
      </Dialog>
    </AdminListPage>
  );
}
