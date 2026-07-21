"use client";

import React, { useState } from "react";
import { GripVertical, Layout, Image as ImageIcon, Globe, Award, Target, UserCheck } from "lucide-react";
import { CMSModuleProps } from "./types";

const SECTION_DATA: Record<string, { title: string; desc: string; icon: React.ElementType; color: string }> = {
  hero: {
    title: "Hero & Services Pathway",
    desc: "Top section containing main brand headlines, backgrounds, and MBA/Consulting quick-link cards.",
    icon: ImageIcon,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  bio: {
    title: "Hey, I'm Gathoni Bio Narrative",
    desc: "Personal story intro with dynamic bio text, scholarship journey, and industry experience.",
    icon: UserCheck,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
  },
  credentials: {
    title: "Credentials & Proof Grid",
    desc: "Reorganizable portfolio qualifications, Said Business School, Laidlaw scholarship, and McKinsey fellowships.",
    icon: Award,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  },
  african_coach: {
    title: "Why an African Coach Advantage",
    desc: "Professional portrait overlay, unique perspective, and customized value propositions.",
    icon: Globe,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  cta: {
    title: "Call-to-Action Discovery Call",
    desc: "Interactive maroon card that prompts users to book their free discovery call.",
    icon: Target,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
  }
};

const DEFAULT_DATA = {
  title: "Section",
  desc: "Custom page section",
  icon: Layout,
  color: "text-muted-foreground bg-muted/10 border-muted/20"
};

function getSectionsList(localSettings: CMSModuleProps["localSettings"]): string[] {
  try {
    const val = localSettings["landing_sections_order_json"];
    if (!val) return ["hero", "bio", "credentials", "african_coach", "cta"];
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["hero", "bio", "credentials", "african_coach", "cta"];
  } catch {
    return ["hero", "bio", "credentials", "african_coach", "cta"];
  }
}

export function SectionOrderEditor({ localSettings, setLocalSettings }: CMSModuleProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sections = getSectionsList(localSettings);

  const updateSections = (newList: string[]) => {
    setLocalSettings({
      ...localSettings,
      landing_sections_order_json: JSON.stringify(newList)
    });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };
  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const current = [...sections];
    const item = current[draggedIndex];
    current.splice(draggedIndex, 1);
    current.splice(index, 0, item);
    updateSections(current);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
        <h4 className="font-bold text-sm text-primary italic mb-1">Drag-and-Sort Page Sections</h4>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Grab the handle on the left of any card, drag it to your desired position, and drop it. Click <strong>Apply Changes</strong> to update the live website storefront instantly.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sectionId, idx) => {
          const data = SECTION_DATA[sectionId] || DEFAULT_DATA;
          const SectionIcon = data.icon;
          const isDragging = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-5 bg-card cursor-grab active:cursor-grabbing ${
                isDragging ? "opacity-40 border-dashed border-primary/40 bg-muted/20 scale-[0.98]" :
                isDragOver ? "border-primary bg-primary/5 scale-[1.02]" :
                "border-border hover:border-primary/20 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-5">
                <div className="p-2 text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors shrink-0">
                  <GripVertical size={20} />
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${data.color}`}>
                  <SectionIcon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground">{data.title}</h5>
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">ID: {sectionId}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-black uppercase bg-secondary text-primary border border-border px-3 py-1.5 rounded-full shadow-sm">
                  {idx === 0 ? "Top Section" : idx === sections.length - 1 ? "Bottom Section" : `Position #${idx + 1}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
