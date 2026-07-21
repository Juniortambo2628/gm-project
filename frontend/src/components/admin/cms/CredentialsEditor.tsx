"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/card";
import { CMSModuleProps, CredentialItem } from "./types";

const ICON_OPTIONS = [
  { label: "Graduation (MBA)", value: "GraduationCap" },
  { label: "Briefcase (Consulting)", value: "Briefcase" },
  { label: "Award (Scholarship)", value: "Award" },
  { label: "Target (Goal)", value: "Target" },
  { label: "Users (Clients)", value: "Users" },
  { label: "Map Pin (Location)", value: "MapPin" },
  { label: "Shield (Security)", value: "ShieldCheck" },
  { label: "Globe (Global)", value: "Globe" }
];

function getList(localSettings: CMSModuleProps["localSettings"]): CredentialItem[] {
  try {
    const val = localSettings["credentials_json"];
    if (!val) return [];
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CredentialsEditor({ localSettings, setLocalSettings }: CMSModuleProps) {
  const credentials = getList(localSettings);

  const updateList = (newList: CredentialItem[]) => {
    setLocalSettings({
      ...localSettings,
      credentials_json: JSON.stringify(newList)
    });
  };

  const addItem = () => {
    updateList([...credentials, { icon: "GraduationCap", title: "New Title", subtitle: "New Subtitle", desc: "Description here" }]);
  };

  const removeItem = (idx: number) => {
    updateList(credentials.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof CredentialItem, value: string) => {
    const updated = credentials.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    updateList(updated);
  };

  return (
    <div className="pt-8 border-t border-border space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h4 className="text-md font-bold text-foreground">Interactive Credentials Builder</h4>
          <p className="text-xs text-muted-foreground italic">Add or edit credentials dynamically without touching JSON code.</p>
        </div>
        <Button type="button" onClick={addItem} className="rounded-full h-10 px-5 font-bold text-xs gap-2">
          <Plus size={14} /> Add Credential
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {credentials.map((item, idx) => (
          <Card key={idx} className="p-6 rounded-2xl border border-primary/10 relative overflow-hidden bg-muted/10 space-y-4">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full">
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Icon Type</label>
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(idx, "icon", e.target.value)}
                  className="w-full h-10 bg-background border border-primary/10 rounded-xl px-3 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Title</label>
                <Input value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Subtitle</label>
                <Input value={item.subtitle} onChange={(e) => updateItem(idx, "subtitle", e.target.value)} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Description</label>
                <Textarea rows={2} value={item.desc} onChange={(e) => updateItem(idx, "desc", e.target.value)} className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" />
              </div>
            </div>
          </Card>
        ))}
        {credentials.length === 0 && (
          <div className="col-span-2 py-12 text-center text-muted-foreground font-medium italic border border-dashed rounded-3xl">
            No credentials added yet. Click &apos;Add Credential&apos; to start.
          </div>
        )}
      </div>
    </div>
  );
}
