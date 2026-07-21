"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Globe,
  Save,
  RefreshCcw,
  Settings,
  FileText,
  ChevronRight,
  ShieldCheck,
  Type,
  Layout,
  MousePointer2,
  Lock,
  ArrowRight,
  KeyRound,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import DashboardHero from "@/components/DashboardHero";
import axiosInstance from "@/lib/axios";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import dynamic from "next/dynamic";
import {
  SectionOrderEditor,
  CredentialsEditor,
  PasswordChangeForm,
  TwoFactorSettings,
} from "@/components/admin/cms";

const FilePondUploader = dynamic(() => import("@/components/admin/FilePondUploader"), { ssr: false });
const HeroBackgroundsSection = dynamic(() => import("@/components/admin/HeroBackgroundsSection"), { ssr: false });

const HERO_BACKGROUNDS = [
  { key: "hero_background_path", label: "Landing Page Hero", hasPosition: true, hasMobile: true },
  { key: "mba_hero_bg", label: "MBA Admissions Hero", hasPosition: true, hasMobile: true },
  { key: "consulting_hero_bg", label: "Consulting Prep Hero", hasPosition: true, hasMobile: true },
  { key: "testimonials_hero_bg", label: "Testimonials Hero", hasPosition: true, hasMobile: false },
  { key: "book_hero_bg", label: "Book/Discovery Hero", hasPosition: true, hasMobile: true },
  { key: "contact_hero_bg", label: "Contact Hero", hasPosition: true, hasMobile: false },
  { key: "guide_hero_bg", label: "MBA & Consulting Guide Hero", hasPosition: true, hasMobile: true },
  { key: "africa_hero_bg", label: "Africa Story Hero", hasPosition: true, hasMobile: false },
  { key: "blog_hero_bg", label: "Blog Hero", hasPosition: true, hasMobile: false },
];

const modules = [
  { id: "sections_order", title: "Page Sections Order", icon: Layout, desc: "Drag, drop, and reorganize landing page sections layout order.", bg: "bg-indigo-500/5" },
  { id: "branding", title: "Brand Identity", icon: ShieldCheck, desc: "Site name, contact email, location, and official URLs.", bg: "bg-blue-500/5" },
  { id: "hero", title: "Hero & Backgrounds", icon: Layout, desc: "Headlines, service boxes, and page hero backgrounds.", bg: "bg-amber-500/5" },
  { id: "seo", title: "Global SEO", icon: Globe, desc: "How your site appears on search engines.", bg: "bg-emerald-500/5" },
  { id: "about", title: "Bio & Credentials", icon: Type, desc: "Biography, credentials, and African advantage section.", bg: "bg-rose-500/5" },
  { id: "services_content", title: "Services Detail", icon: FileText, desc: "Customize headlines and text on MBA & Consulting pages.", bg: "bg-indigo-500/5" },
  { id: "other_pages_content", title: "Sub-Pages Content", icon: Settings, desc: "Narrative copy for Africa, Testimonials, Book & Contact pages.", bg: "bg-purple-500/5" },
  { id: "security", title: "Security & Auth", icon: Lock, desc: "Change your admin password and manage two-factor authentication.", bg: "bg-emerald-500/5" },
  { id: "api_keys", title: "API & Integrations", icon: KeyRound, desc: "Configure Calendly URLs and external integration endpoints.", bg: "bg-cyan-500/5" },
];

export default function CMSPage() {
  const { settings, refreshSettings, isLoading: cmsLoading } = useSiteSettings();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!cmsLoading) setLocalSettings(settings || {});
  }, [cmsLoading, settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const mediaKeys = ["logo_light", "logo_dark", "favicon"];
      const payload = { ...localSettings };
      for (const key of mediaKeys) {
        if (payload[key] && String(payload[key]).startsWith("http://localhost")) delete payload[key];
      }
      await axiosInstance.post("/cms/settings", { settings: payload });
      toast.success("Settings saved successfully");
      refreshSettings();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (cmsLoading) return <div className="p-12 text-center">Loading Settings Hub...</div>;

  const sharedProps = { localSettings, setLocalSettings, saving, setSaving, refreshSettings };

  return (
    <div className="animate-fade-in space-y-12 pb-20 relative">
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-20 pointer-events-none z-0" />

      <DashboardHero title="Website CMS Hub" description="Select a module to manage its content." />

      {activeModule ? (
        <div className="space-y-8 animate-slide-up relative z-10">
          <Button variant="ghost" onClick={() => setActiveModule(null)} className="group text-muted-foreground hover:text-primary font-bold transition-all px-0">
            <ArrowRight className="rotate-180 mr-2 group-hover:mr-4 transition-all" size={16} />
            Back to Hub
          </Button>

          <Card className="rounded-[24px] border border-primary/10 shadow-xl overflow-hidden bg-card">
            <div className="p-6 border-b flex items-center justify-between bg-muted/10">
              <div>
                <h3 className="text-xl font-black capitalize tracking-tight text-foreground">{activeModule.replace(/_/g, " ")} Settings</h3>
                <p className="text-xs font-medium text-muted-foreground italic">Edit settings and click save to apply changes.</p>
              </div>
              {activeModule !== "security" && (
                <Button onClick={handleSaveSettings} disabled={saving} className="rounded-full px-8 h-12 font-black">
                  {saving ? <RefreshCcw className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                  Apply Changes
                </Button>
              )}
            </div>

            <CardContent className="p-6 md:p-8 w-full space-y-10">
              {activeModule === "sections_order" && <SectionOrderEditor {...sharedProps} />}
              {activeModule === "branding" && <BrandingModule {...sharedProps} />}
              {activeModule === "hero" && <HeroModule {...sharedProps} />}
              {activeModule === "seo" && <SeoModule {...sharedProps} />}
              {activeModule === "about" && <AboutModule {...sharedProps} />}
              {activeModule === "services_content" && <ServicesContentModule {...sharedProps} />}
              {activeModule === "other_pages_content" && <OtherPagesContentModule {...sharedProps} />}
              {activeModule === "security" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                  <PasswordChangeForm />
                  <TwoFactorSettings {...sharedProps} />
                </div>
              )}
              {activeModule === "api_keys" && <ApiKeysModule {...sharedProps} />}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up relative z-10">
          {modules.map((mod) => (
            <div key={mod.id} onClick={() => setActiveModule(mod.id)} className="group cursor-pointer relative">
              <Card className="h-full rounded-[40px] border border-white/20 dark:border-white/10 bg-black/40 backdrop-blur-md shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 transition-all duration-500 hover:translate-y-[-12px] hover:bg-black/50 hover:border-white/30 hover:shadow-primary/20">
                <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/10">
                  <mod.icon size={44} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2 text-white tracking-tight">{mod.title}</h3>
                  <p className="text-[13px] font-medium text-white/80 leading-relaxed px-2">{mod.desc}</p>
                </div>
                <div className="mt-auto pt-6 w-full">
                  <div className="h-12 w-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-white group-hover:bg-white group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Card>
            </div>
          ))}

          <Card className="col-span-1 md:col-span-2 lg:col-span-3 rounded-[40px] bg-primary text-white p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl animate-pulse-slow">
            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="flex items-center gap-3">
                <Lock className="text-white/40" size={24} />
                <h3 className="text-3xl font-black tracking-tight italic">Security & Permissions</h3>
              </div>
              <p className="text-md font-medium text-white/70">Manage your administrative password and two-factor authentication settings.</p>
              <Button onClick={() => setActiveModule("security")} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white hover:text-primary rounded-full px-8 h-12 font-bold transition-all">
                Access settings
              </Button>
            </div>
            <div className="relative z-10 opacity-30">
              <MousePointer2 size={120} strokeWidth={0.5} />
            </div>
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-20px] left-[20%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---- Inline module form components (simple form fields) ---- */
// These are kept inline because they're simple form layouts with no complex logic.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModuleProps = { localSettings: Record<string, any>; setLocalSettings: (s: Record<string, any>) => void; saving: boolean; setSaving: (v: boolean) => void; refreshSettings: () => void };

function BrandingModule({ localSettings, setLocalSettings, saving: _saving, setSaving }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Branding & Links</h4>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Site Official Name</label>
          <Input value={localSettings["site_name"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, site_name: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Contact Email</label>
          <Input value={localSettings["contact_email"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, contact_email: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">LinkedIn URL</label>
          <Input value={localSettings["linkedin_url"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, linkedin_url: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Location Details</label>
          <Input value={localSettings["contact_location"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, contact_location: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6" placeholder="Oxford, UK (GMT)" />
        </div>
      </div>
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Official Media Assets</h4>
        <div className="grid grid-cols-1 gap-6">
          <FilePondUploader uploadKey="logo_light" label="Logo (Light Mode)" onSuccess={(url) => setLocalSettings({ ...localSettings, logo_light: url })} onProcessFile={() => setSaving(true)} onProcessFileEnd={() => setSaving(false)} currentValue={localSettings["logo_light"]} />
          <FilePondUploader uploadKey="logo_dark" label="Logo (Dark Mode)" onSuccess={(url) => setLocalSettings({ ...localSettings, logo_dark: url })} onProcessFile={() => setSaving(true)} onProcessFileEnd={() => setSaving(false)} currentValue={localSettings["logo_dark"]} />
          <FilePondUploader uploadKey="favicon" label="Favicon" onSuccess={(url) => setLocalSettings({ ...localSettings, favicon: url })} onProcessFile={() => setSaving(true)} onProcessFileEnd={() => setSaving(false)} acceptedFileTypes={["image/x-icon", "image/png", "image/jpeg"]} currentValue={localSettings["favicon"]} />
        </div>
      </div>
    </div>
  );
}

function HeroModule({ localSettings, setLocalSettings, saving: _saving, setSaving }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Homepage Text Elements</h4>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Headline</label>
          <Input value={localSettings["hero_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, hero_headline: e.target.value })} className="h-14 rounded-xl bg-muted/30 border-none font-black px-6" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Tagline</label>
          <Input value={localSettings["hero_tagline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, hero_tagline: e.target.value })} className="h-14 rounded-xl bg-muted/30 border-none font-bold px-6" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Box Description</label>
          <Textarea rows={3} value={localSettings["homepage_mba_desc"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, homepage_mba_desc: e.target.value })} className="rounded-xl bg-muted/30 border-none font-medium p-4" />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Box Description</label>
          <Textarea rows={3} value={localSettings["homepage_consulting_desc"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, homepage_consulting_desc: e.target.value })} className="rounded-xl bg-muted/30 border-none font-medium p-4" />
        </div>
      </div>
      <div className="space-y-6">
        <HeroBackgroundsSection backgrounds={HERO_BACKGROUNDS} localSettings={localSettings} setLocalSettings={setLocalSettings} setSaving={setSaving} />
      </div>
    </div>
  );
}

function SeoModule({ localSettings, setLocalSettings }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Meta Title Tag</label>
        <Input value={localSettings["meta_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, meta_title: e.target.value })} className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Meta Description</label>
        <Textarea rows={6} value={localSettings["meta_description"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, meta_description: e.target.value })} className="rounded-2xl bg-muted/30 border-none font-medium p-6" />
      </div>
    </div>
  );
}

function AboutModule({ localSettings, setLocalSettings, saving, setSaving }: ModuleProps) {
  return (
    <div className="space-y-10 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Bio Narratives</h4>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hey Intro</label>
            <Input value={localSettings["about_hey_gathoni"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, about_hey_gathoni: e.target.value })} className="h-12 rounded-xl bg-muted/30 border-none font-black px-6 text-primary" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Subtle Tagline</label>
            <Input value={localSettings["about_tagline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, about_tagline: e.target.value })} className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Narrative Biography (Full)</label>
            <Textarea rows={8} value={localSettings["about_bio_full"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, about_bio_full: e.target.value })} className="rounded-2xl bg-muted/30 border-none font-medium p-6 leading-relaxed" />
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">African Advantage & Portrait</h4>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 mb-2 block">Portrait Image</label>
            <FilePondUploader uploadKey="about_portrait_path" label="About Portrait" onSuccess={(url) => setLocalSettings({ ...localSettings, about_portrait_path: url })} onProcessFile={() => setSaving(true)} onProcessFileEnd={() => setSaving(false)} currentValue={localSettings["about_portrait_path"]} />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Headline</label>
            <Input value={localSettings["african_coach_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, african_coach_headline: e.target.value })} className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Description</label>
            <Textarea rows={4} value={localSettings["african_coach_description"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, african_coach_description: e.target.value })} className="rounded-xl bg-muted/30 border-none font-medium p-4" />
          </div>
        </div>
      </div>
      <CredentialsEditor localSettings={localSettings} setLocalSettings={setLocalSettings} saving={saving} setSaving={setSaving} refreshSettings={() => {}} />
    </div>
  );
}

function ServicesContentModule({ localSettings, setLocalSettings }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2"><GraduationCap size={16} /> MBA Page Content</h4>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Hero Title</label><Input value={localSettings["mba_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, mba_hero_title: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Hero Subtitle</label><Textarea rows={3} value={localSettings["mba_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, mba_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Narrative Section Headline</label><Input value={localSettings["mba_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, mba_headline: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Narrative Section Description</label><Textarea rows={4} value={localSettings["mba_description"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, mba_description: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
      </div>
      <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2"><Briefcase size={16} /> Consulting Page Content</h4>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Hero Title</label><Input value={localSettings["consulting_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, consulting_hero_title: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Hero Subtitle</label><Textarea rows={3} value={localSettings["consulting_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, consulting_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Narrative Section Headline</label><Input value={localSettings["consulting_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, consulting_headline: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Narrative Section Description</label><Textarea rows={4} value={localSettings["consulting_description"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, consulting_description: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
      </div>
    </div>
  );
}

function OtherPagesContentModule({ localSettings, setLocalSettings }: ModuleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
      <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2"><Globe size={16} /> Africa Page Copy</h4>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Africa Hero Title</label><Input value={localSettings["africa_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_hero_title: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Africa Hero Subtitle</label><Textarea rows={3} value={localSettings["africa_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Mission Highlight Quote</label><Textarea rows={2} value={localSettings["africa_mission_quote"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_mission_quote: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 1</label><Textarea rows={3} value={localSettings["africa_core_para_1"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_core_para_1: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 2 (Bold highlight)</label><Textarea rows={2} value={localSettings["africa_core_para_2"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_core_para_2: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 3</label><Textarea rows={3} value={localSettings["africa_core_para_3"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_core_para_3: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Bottom Visual Quote Headline</label><Textarea rows={2} value={localSettings["africa_bottom_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_bottom_headline: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
        <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Bottom Visual Quote Subtext</label><Textarea rows={2} value={localSettings["africa_bottom_text"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, africa_bottom_text: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" /></div>
      </div>
      <div className="space-y-8 bg-muted/5 p-6 rounded-3xl border border-primary/5 h-fit">
        <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2"><FileText size={16} /> Testimonials, Booking & Contact Details</h4>
        <div className="space-y-4 border-b pb-6">
          <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Testimonials Page</h5>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label><Input value={localSettings["testimonials_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, testimonials_hero_title: e.target.value })} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" /></div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label><Textarea rows={2} value={localSettings["testimonials_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, testimonials_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" /></div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Success Metric Headline</label><Input value={localSettings["testimonials_success_headline"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, testimonials_success_headline: e.target.value })} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" /></div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Success Metric Description</label><Textarea rows={2} value={localSettings["testimonials_success_description"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, testimonials_success_description: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" /></div>
        </div>
        <div className="space-y-4 border-b pb-6">
          <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Booking Page</h5>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label><Input value={localSettings["book_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, book_hero_title: e.target.value })} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" /></div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label><Textarea rows={2} value={localSettings["book_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, book_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" /></div>
        </div>
        <div className="space-y-4">
          <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Contact Page</h5>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label><Input value={localSettings["contact_hero_title"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, contact_hero_title: e.target.value })} className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" /></div>
          <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label><Textarea rows={2} value={localSettings["contact_hero_subtitle"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, contact_hero_subtitle: e.target.value })} className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" /></div>
        </div>
      </div>
    </div>
  );
}

function ApiKeysModule({ localSettings, setLocalSettings }: ModuleProps) {
  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 bg-muted/5 p-6 md:p-8 rounded-3xl border border-primary/5">
      <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2"><KeyRound size={16} /> Calendly Integration URLs</h4>
      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Discovery Call Calendly URL</label><Input value={localSettings["discovery_calendly_url"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, discovery_calendly_url: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" placeholder="https://calendly.com/your-id/discovery" /></div>
      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Strategy Calendly URL</label><Input value={localSettings["mba_calendly_url"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, mba_calendly_url: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" placeholder="https://calendly.com/your-id/mba-prep" /></div>
      <div className="space-y-3"><label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Prep Calendly URL</label><Input value={localSettings["consulting_calendly_url"] || ""} onChange={(e) => setLocalSettings({ ...localSettings, consulting_calendly_url: e.target.value })} className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" placeholder="https://calendly.com/your-id/mock-interview" /></div>
      <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Payment & Email credentials</p>
        <p className="text-xs text-muted-foreground font-medium">Paystack keys and SMTP credentials are now managed via backend environment variables and Laravel config. They are no longer stored or exposed through this CMS.</p>
      </div>
    </div>
  );
}
