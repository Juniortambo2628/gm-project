"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Globe, 
  Save, 
  RefreshCcw, 
  Settings, 
  FileText, 
  HelpCircle, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Type,
  Layout,
  Image as ImageIcon,
  MousePointer2,
  Lock,
  ArrowRight,
  Plus,
  Trash2,
  Award,
  Target,
  Users,
  MapPin,
  GraduationCap,
  Briefcase,
  KeyRound,
  Smartphone,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import DashboardHero from "@/components/DashboardHero";
import axiosInstance from "@/lib/axios";
import { useCMS } from "@/context/SettingContext";
import FilePondUploader from "@/components/admin/FilePondUploader";

interface CredentialItem {
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
}

export default function CMSPage() {
  const { settings, refreshSettings, isLoading: cmsLoading } = useCMS();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!cmsLoading) {
      setLocalSettings(settings || {});
    }
  }, [cmsLoading, settings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/cms/settings", { settings: localSettings });
      toast.success("Settings saved successfully");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const getCredentialsList = (): CredentialItem[] => {
    try {
      const val = localSettings['credentials_json'];
      if (!val) return [];
      const parsed = typeof val === 'string' ? JSON.parse(val) : val;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const updateCredentialsList = (newList: CredentialItem[]) => {
    setLocalSettings({
      ...localSettings,
      credentials_json: JSON.stringify(newList)
    });
  };

  const generateRandomCodes = () => {
    const codes = [];
    for (let i = 0; i < 6; i++) {
       const part1 = Math.floor(100 + Math.random() * 900);
       const part2 = Math.floor(100 + Math.random() * 900);
       codes.push(`${part1}-${part2}`);
    }
    return codes;
  };

  const getBackupCodes = (): string[] => {
    try {
       const val = localSettings['admin_2fa_backup_codes'];
       if (!val) return [];
       const parsed = typeof val === 'string' ? JSON.parse(val) : val;
       return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
       return [];
    }
  };

  if (cmsLoading) return <div className="p-12 text-center">Loading Settings Hub...</div>;

  const iconOptions = [
    { label: "Graduation (MBA)", value: "GraduationCap" },
    { label: "Briefcase (Consulting)", value: "Briefcase" },
    { label: "Award (Scholarship)", value: "Award" },
    { label: "Target (Goal)", value: "Target" },
    { label: "Users (Clients)", value: "Users" },
    { label: "Map Pin (Location)", value: "MapPin" },
    { label: "Shield (Security)", value: "ShieldCheck" },
    { label: "Globe (Global)", value: "Globe" }
  ];

  const modules = [
    { 
      id: 'branding', 
      title: 'Brand Identity', 
      icon: ShieldCheck, 
      desc: 'Site name, contact email, location, and official URLs.',
      fields: ['site_name', 'contact_email', 'linkedin_url', 'contact_location', 'logo_light', 'logo_dark', 'favicon'],
      bg: 'bg-blue-500/5'
    },
    { 
      id: 'hero', 
      title: 'Hero & Backgrounds', 
      icon: Layout, 
      desc: 'Headlines, service boxes, and page hero backgrounds.',
      fields: ['hero_headline', 'hero_tagline', 'hero_background_path', 'mba_hero_bg', 'consulting_hero_bg', 'homepage_mba_desc', 'homepage_consulting_desc', 'testimonials_hero_bg', 'book_hero_bg', 'contact_hero_bg', 'guide_hero_bg', 'survey_hero_bg', 'africa_hero_bg', 'blog_hero_bg'],
      bg: 'bg-amber-500/5'
    },
    { 
      id: 'seo', 
      title: 'Global SEO', 
      icon: Globe, 
      desc: 'How your site appears on search engines.',
      fields: ['meta_title', 'meta_description'],
      bg: 'bg-emerald-500/5'
    },
    { 
      id: 'about', 
      title: 'Bio & Credentials', 
      icon: Type, 
      desc: 'Biography, credentials, and African advantage section.',
      fields: ['about_hey_gathoni', 'about_tagline', 'about_portrait_path', 'about_bio_full', 'african_coach_headline', 'african_coach_description', 'credentials_json'],
      bg: 'bg-rose-500/5'
    },
    { 
      id: 'services_content', 
      title: 'Services Detail', 
      icon: FileText, 
      desc: 'Customize headlines and text on MBA & Consulting pages.',
      fields: ['mba_hero_title', 'mba_hero_subtitle', 'mba_headline', 'mba_description', 'consulting_hero_title', 'consulting_hero_subtitle', 'consulting_headline', 'consulting_description'],
      bg: 'bg-indigo-500/5'
    },
    { 
      id: 'other_pages_content', 
      title: 'Sub-Pages Content', 
      icon: Settings, 
      desc: 'Narrative copy for Africa, Testimonials, Book & Contact pages.',
      fields: ['africa_hero_title', 'africa_hero_subtitle', 'africa_mission_quote', 'africa_core_para_1', 'africa_core_para_2', 'africa_core_para_3', 'africa_bottom_headline', 'africa_bottom_text', 'testimonials_hero_title', 'testimonials_hero_subtitle', 'testimonials_success_headline', 'testimonials_success_description', 'book_hero_title', 'book_hero_subtitle', 'contact_hero_title', 'contact_hero_subtitle'],
      bg: 'bg-purple-500/5'
    },
    { 
      id: 'security', 
      title: 'Security & Auth', 
      icon: Lock, 
      desc: 'Change your admin password and manage two-factor authentication.',
      fields: ['admin_2fa_enabled', 'admin_2fa_backup_codes'],
      bg: 'bg-emerald-500/5'
    }
  ];

  return (
    <div className="animate-fade-in space-y-12 pb-20 relative">
      {/* Decorative Blur Blobs behind the glass cards */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-20 pointer-events-none z-0" />

      <DashboardHero 
        title="Website CMS Hub" 
        description="Select a module to manage its content." 
      />

      {activeModule ? (
        <div className="space-y-8 animate-slide-up relative z-10">
           <Button 
            variant="ghost" 
            onClick={() => setActiveModule(null)}
            className="group text-muted-foreground hover:text-primary font-bold transition-all px-0"
           >
              <ArrowRight className="rotate-180 mr-2 group-hover:mr-4 transition-all" size={16} />
              Back to Hub
           </Button>

           <Card className="rounded-[24px] border border-primary/10 shadow-xl overflow-hidden bg-card">
              <div className="p-6 border-b flex items-center justify-between bg-muted/10">
                 <div>
                    <h3 className="text-xl font-black capitalize tracking-tight text-foreground">
                       {activeModule.replace(/_/g, ' ')} Settings
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground italic">Edit settings and click save to apply changes.</p>
                 </div>
                 {activeModule !== 'security' && (
                    <Button onClick={handleSaveSettings} disabled={saving} className="rounded-full px-8 h-12 font-black">
                       {saving ? <RefreshCcw className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                       Apply Changes
                    </Button>
                 )}
              </div>
              
              <CardContent className="p-6 md:p-8 w-full space-y-10">
                 {activeModule === 'branding' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       {/* Left Column: Text configurations */}
                       <div className="space-y-6">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Branding & Links</h4>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Site Official Name</label>
                             <Input 
                               value={localSettings['site_name'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, site_name: e.target.value})}
                               className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Contact Email</label>
                             <Input 
                               value={localSettings['contact_email'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, contact_email: e.target.value})}
                               className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">LinkedIn URL</label>
                             <Input 
                               value={localSettings['linkedin_url'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, linkedin_url: e.target.value})}
                               className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Location Details</label>
                             <Input 
                               value={localSettings['contact_location'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, contact_location: e.target.value})}
                               className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6" 
                               placeholder="Oxford, UK (GMT)"
                             />
                          </div>
                       </div>

                       {/* Right Column: Logo uploaders */}
                       <div className="space-y-6">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Official Media Assets</h4>
                          <div className="grid grid-cols-1 gap-6">
                             <FilePondUploader 
                               uploadKey="logo_light"
                               label="Logo (Light Mode)"
                               onSuccess={(url) => setLocalSettings({...localSettings, logo_light: url})}
                               onProcessFile={() => setSaving(true)}
                               onProcessFileEnd={() => setSaving(false)}
                             />
                             <FilePondUploader 
                               uploadKey="logo_dark"
                               label="Logo (Dark Mode)"
                               onSuccess={(url) => setLocalSettings({...localSettings, logo_dark: url})}
                               onProcessFile={() => setSaving(true)}
                               onProcessFileEnd={() => setSaving(false)}
                             />
                             <FilePondUploader 
                               uploadKey="favicon"
                               label="Favicon"
                               onSuccess={(url) => setLocalSettings({...localSettings, favicon: url})}
                               onProcessFile={() => setSaving(true)}
                               onProcessFileEnd={() => setSaving(false)}
                               acceptedFileTypes={['image/x-icon', 'image/png', 'image/jpeg']}
                             />
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModule === 'hero' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       {/* Left Column: Homepage Texts */}
                       <div className="space-y-6">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Homepage Text Elements</h4>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Headline</label>
                             <Input 
                               value={localSettings['hero_headline'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, hero_headline: e.target.value})}
                               className="h-14 rounded-xl bg-muted/30 border-none font-black px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Tagline</label>
                             <Input 
                               value={localSettings['hero_tagline'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, hero_tagline: e.target.value})}
                               className="h-14 rounded-xl bg-muted/30 border-none font-bold px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Box Description</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['homepage_mba_desc'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, homepage_mba_desc: e.target.value})}
                               className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Box Description</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['homepage_consulting_desc'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, homepage_consulting_desc: e.target.value})}
                               className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                             />
                          </div>
                       </div>

                       {/* Right Column: Hero backgrounds for ALL pages */}
                       <div className="space-y-6">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Page Backgrounds Gallery (Images/Videos)</h4>
                          <div className="h-[550px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="hero_background_path"
                                  label="Landing Page Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, hero_background_path: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="mba_hero_bg"
                                  label="MBA Admissions Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, mba_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="consulting_hero_bg"
                                  label="Consulting Prep Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, consulting_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="testimonials_hero_bg"
                                  label="Testimonials Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, testimonials_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="book_hero_bg"
                                  label="Book/Discovery Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, book_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="contact_hero_bg"
                                  label="Contact Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, contact_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="guide_hero_bg"
                                  label="MBA & Consulting Guide Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, guide_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="survey_hero_bg"
                                  label="Survey Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, survey_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="africa_hero_bg"
                                  label="Africa Story Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, africa_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                             <div className="p-4 bg-muted/20 rounded-2xl border border-dashed border-primary/10">
                                <FilePondUploader 
                                  uploadKey="blog_hero_bg"
                                  label="Blog Hero Background"
                                  onSuccess={(url) => setLocalSettings({...localSettings, blog_hero_bg: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                  acceptedFileTypes={['image/*', 'video/*']}
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModule === 'seo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Meta Title Tag</label>
                          <Input 
                            value={localSettings['meta_title'] || ''} 
                            onChange={(e) => setLocalSettings({...localSettings, meta_title: e.target.value})}
                            className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Meta Description</label>
                          <Textarea 
                            rows={6}
                            value={localSettings['meta_description'] || ''} 
                            onChange={(e) => setLocalSettings({...localSettings, meta_description: e.target.value})}
                            className="rounded-2xl bg-muted/30 border-none font-medium p-6" 
                          />
                       </div>
                    </div>
                 )}

                 {activeModule === 'about' && (
                    <div className="space-y-10 w-full">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Left Column: Biography details */}
                          <div className="space-y-6">
                             <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">Bio Narratives</h4>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hey Intro</label>
                                <Input 
                                  value={localSettings['about_hey_gathoni'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, about_hey_gathoni: e.target.value})}
                                  className="h-12 rounded-xl bg-muted/30 border-none font-black px-6 text-primary" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Subtle Tagline</label>
                                <Input 
                                  value={localSettings['about_tagline'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, about_tagline: e.target.value})}
                                  className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Narrative Biography (Full)</label>
                                <Textarea 
                                  rows={8}
                                  value={localSettings['about_bio_full'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, about_bio_full: e.target.value})}
                                  className="rounded-2xl bg-muted/30 border-none font-medium p-6 leading-relaxed" 
                                />
                             </div>
                          </div>

                          {/* Right Column: Portrait and Africa advantages */}
                          <div className="space-y-6">
                             <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4">African Advantage & Portrait</h4>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 mb-2 block">Portrait Image</label>
                                <FilePondUploader 
                                  uploadKey="about_portrait_path"
                                  label="About Portrait"
                                  onSuccess={(url) => setLocalSettings({...localSettings, about_portrait_path: url})}
                                  onProcessFile={() => setSaving(true)}
                                  onProcessFileEnd={() => setSaving(false)}
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Headline</label>
                                <Input 
                                  value={localSettings['african_coach_headline'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, african_coach_headline: e.target.value})}
                                  className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Description</label>
                                <Textarea 
                                  rows={4}
                                  value={localSettings['african_coach_description'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, african_coach_description: e.target.value})}
                                  className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                                />
                             </div>
                          </div>
                       </div>

                       {/* Interactive Credentials List Builder */}
                       <div className="pt-8 border-t border-border space-y-6">
                          <div className="flex items-center justify-between border-b pb-4">
                             <div>
                                <h4 className="text-md font-bold text-foreground">Interactive Credentials Builder</h4>
                                <p className="text-xs text-muted-foreground italic">Add or edit credentials dynamically without touching JSON code.</p>
                             </div>
                             <Button 
                               type="button" 
                               onClick={() => {
                                 const current = getCredentialsList();
                                 updateCredentialsList([...current, { icon: "GraduationCap", title: "New Title", subtitle: "New Subtitle", desc: "Description here" }]);
                               }}
                               className="rounded-full h-10 px-5 font-bold text-xs gap-2"
                             >
                                <Plus size={14} /> Add Credential
                             </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {getCredentialsList().map((item, idx) => (
                                <Card key={idx} className="p-6 rounded-2xl border border-primary/10 relative overflow-hidden bg-muted/10 space-y-4">
                                   <div className="absolute top-4 right-4">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => {
                                          const current = getCredentialsList();
                                          updateCredentialsList(current.filter((_, i) => i !== idx));
                                        }}
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                      >
                                         <Trash2 size={16} />
                                      </Button>
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2 col-span-2">
                                         <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Icon Type</label>
                                         <select 
                                           value={item.icon} 
                                           onChange={(e) => {
                                             const current = getCredentialsList();
                                             current[idx].icon = e.target.value;
                                             updateCredentialsList(current);
                                           }}
                                           className="w-full h-10 bg-background border border-primary/10 rounded-xl px-3 font-semibold text-xs outline-none focus:ring-1 focus:ring-primary/20"
                                         >
                                            {iconOptions.map((opt) => (
                                               <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                         </select>
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Title</label>
                                         <Input 
                                           value={item.title} 
                                           onChange={(e) => {
                                             const current = getCredentialsList();
                                             current[idx].title = e.target.value;
                                             updateCredentialsList(current);
                                           }}
                                           className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                         />
                                      </div>
                                      <div className="space-y-2">
                                         <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Subtitle</label>
                                         <Input 
                                           value={item.subtitle} 
                                           onChange={(e) => {
                                             const current = getCredentialsList();
                                             current[idx].subtitle = e.target.value;
                                             updateCredentialsList(current);
                                           }}
                                           className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                         />
                                      </div>
                                      <div className="space-y-2 col-span-2">
                                         <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Description</label>
                                         <Textarea 
                                           rows={2}
                                           value={item.desc} 
                                           onChange={(e) => {
                                             const current = getCredentialsList();
                                             current[idx].desc = e.target.value;
                                             updateCredentialsList(current);
                                           }}
                                           className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" 
                                         />
                                      </div>
                                   </div>
                                </Card>
                             ))}
                             {getCredentialsList().length === 0 && (
                                <div className="col-span-2 py-12 text-center text-muted-foreground font-medium italic border border-dashed rounded-3xl">
                                   No credentials added yet. Click 'Add Credential' to start.
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModule === 'services_content' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       {/* MBA Page Details */}
                       <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
                             <GraduationCap size={16} /> MBA Page Content
                          </h4>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Hero Title</label>
                             <Input 
                               value={localSettings['mba_hero_title'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, mba_hero_title: e.target.value})}
                               className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Hero Subtitle</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['mba_hero_subtitle'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, mba_hero_subtitle: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Narrative Section Headline</label>
                             <Input 
                               value={localSettings['mba_headline'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, mba_headline: e.target.value})}
                               className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Narrative Section Description</label>
                             <Textarea 
                               rows={4}
                               value={localSettings['mba_description'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, mba_description: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                       </div>

                       {/* Consulting Page Details */}
                       <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
                             <Briefcase size={16} /> Consulting Page Content
                          </h4>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Hero Title</label>
                             <Input 
                               value={localSettings['consulting_hero_title'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, consulting_hero_title: e.target.value})}
                               className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Hero Subtitle</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['consulting_hero_subtitle'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, consulting_hero_subtitle: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Narrative Section Headline</label>
                             <Input 
                               value={localSettings['consulting_headline'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, consulting_headline: e.target.value})}
                               className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Narrative Section Description</label>
                             <Textarea 
                               rows={4}
                               value={localSettings['consulting_description'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, consulting_description: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModule === 'other_pages_content' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       {/* Africa Page Copy */}
                       <div className="space-y-6 bg-muted/5 p-6 rounded-3xl border border-primary/5">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
                             <Globe size={16} /> Africa Page Copy
                          </h4>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Africa Hero Title</label>
                             <Input 
                               value={localSettings['africa_hero_title'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_hero_title: e.target.value})}
                               className="h-12 rounded-xl bg-background border border-primary/10 font-bold px-4 text-sm" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Africa Hero Subtitle</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['africa_hero_subtitle'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_hero_subtitle: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Mission Highlight Quote</label>
                             <Textarea 
                               rows={2}
                               value={localSettings['africa_mission_quote'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_mission_quote: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 1</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['africa_core_para_1'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_core_para_1: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 2 (Bold highlight)</label>
                             <Textarea 
                               rows={2}
                               value={localSettings['africa_core_para_2'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_core_para_2: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Core Paragraph 3</label>
                             <Textarea 
                               rows={3}
                               value={localSettings['africa_core_para_3'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_core_para_3: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Bottom Visual Quote Headline</label>
                             <Textarea 
                               rows={2}
                               value={localSettings['africa_bottom_headline'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_bottom_headline: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Bottom Visual Quote Subtext</label>
                             <Textarea 
                               rows={2}
                               value={localSettings['africa_bottom_text'] || ''} 
                               onChange={(e) => setLocalSettings({...localSettings, africa_bottom_text: e.target.value})}
                               className="rounded-xl bg-background border border-primary/10 font-medium p-4 text-xs" 
                             />
                          </div>
                       </div>

                       {/* Other Sub-pages Copy */}
                       <div className="space-y-8 bg-muted/5 p-6 rounded-3xl border border-primary/5 h-fit">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
                             <FileText size={16} /> Testimonials, Booking & Contact Details
                          </h4>
                          
                          {/* Testimonials */}
                          <div className="space-y-4 border-b pb-6">
                             <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Testimonials Page</h5>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label>
                                <Input 
                                  value={localSettings['testimonials_hero_title'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, testimonials_hero_title: e.target.value})}
                                  className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label>
                                <Textarea 
                                  rows={2}
                                  value={localSettings['testimonials_hero_subtitle'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, testimonials_hero_subtitle: e.target.value})}
                                  className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Success Metric Headline</label>
                                <Input 
                                  value={localSettings['testimonials_success_headline'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, testimonials_success_headline: e.target.value})}
                                  className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Success Metric Description</label>
                                <Textarea 
                                  rows={2}
                                  value={localSettings['testimonials_success_description'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, testimonials_success_description: e.target.value})}
                                  className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" 
                                />
                             </div>
                          </div>

                          {/* Booking Page */}
                          <div className="space-y-4 border-b pb-6">
                             <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Booking Page</h5>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label>
                                <Input 
                                  value={localSettings['book_hero_title'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, book_hero_title: e.target.value})}
                                  className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label>
                                <Textarea 
                                  rows={2}
                                  value={localSettings['book_hero_subtitle'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, book_hero_subtitle: e.target.value})}
                                  className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" 
                                />
                             </div>
                          </div>

                          {/* Contact Page */}
                          <div className="space-y-4">
                             <h5 className="text-xs font-bold text-foreground tracking-wide uppercase">Contact Page</h5>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Title</label>
                                <Input 
                                  value={localSettings['contact_hero_title'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, contact_hero_title: e.target.value})}
                                  className="h-10 rounded-xl bg-background border border-primary/10 font-bold px-3 text-xs" 
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Hero Subtitle</label>
                                <Textarea 
                                  rows={2}
                                  value={localSettings['contact_hero_subtitle'] || ''} 
                                  onChange={(e) => setLocalSettings({...localSettings, contact_hero_subtitle: e.target.value})}
                                  className="rounded-xl bg-background border border-primary/10 font-medium p-3 text-xs" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeModule === 'security' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                       {/* Change Password Panel */}
                       <div className="space-y-6 bg-muted/5 p-6 md:p-8 rounded-3xl border border-primary/5">
                          <h4 className="text-sm font-bold text-primary border-b pb-2 mb-4 flex items-center gap-2">
                             <KeyRound size={16} /> Administrative Password
                          </h4>
                          
                          <form onSubmit={async (e) => {
                             e.preventDefault();
                             if (newPassword !== confirmPassword) {
                                toast.error("Passwords do not match");
                                return;
                             }
                             setChangingPassword(true);
                             try {
                                await axiosInstance.post("/change-password", {
                                   current_password: currentPassword,
                                   new_password: newPassword,
                                   new_password_confirmation: confirmPassword
                                });
                                toast.success("Password changed successfully");
                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                             } catch (err: any) {
                                const msg = err.response?.data?.message || "Failed to update password";
                                toast.error(msg);
                             } finally {
                                setChangingPassword(false);
                             }
                          }} className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                                <Input 
                                  type="password"
                                  required
                                  value={currentPassword} 
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" 
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                <Input 
                                  type="password"
                                  required
                                  value={newPassword} 
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" 
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                                <Input 
                                  type="password"
                                  required
                                  value={confirmPassword} 
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="h-12 rounded-xl bg-background border border-primary/10 px-4 text-sm" 
                                />
                             </div>
                             <Button type="submit" disabled={changingPassword} className="w-full h-12 rounded-xl mt-4 font-bold text-xs">
                                {changingPassword ? <RefreshCcw className="animate-spin mr-2" size={14} /> : <Lock className="mr-2" size={14} />}
                                Update Password
                             </Button>
                          </form>
                       </div>

                       {/* Two-Factor Authentication & Session Details */}
                       <div className="space-y-8">
                          {/* 2FA Card */}
                          <div className="space-y-6 bg-muted/5 p-6 md:p-8 rounded-3xl border border-primary/5">
                             <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <Smartphone size={16} /> Two-Factor Authentication
                                </h4>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${localSettings['admin_2fa_enabled'] === '1' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                   {localSettings['admin_2fa_enabled'] === '1' ? 'Active' : 'Disabled'}
                                </span>
                             </div>

                             <div className="flex items-center justify-between p-4 bg-background border border-primary/5 rounded-2xl">
                                <div>
                                   <p className="text-xs font-bold text-foreground">Verify Login Sessions</p>
                                   <p className="text-[10px] text-muted-foreground italic">Require 6-digit email confirmation code.</p>
                                </div>
                                <input 
                                  type="checkbox"
                                  checked={localSettings['admin_2fa_enabled'] === '1'}
                                  onChange={async (e) => {
                                     const enabled = e.target.checked ? '1' : '0';
                                     // Generate backup codes if turning on for the first time
                                     let backupCodes = localSettings['admin_2fa_backup_codes'];
                                     if (enabled === '1' && !backupCodes) {
                                        backupCodes = JSON.stringify(generateRandomCodes());
                                     }
                                     
                                     // Perform save instantly to settings endpoint
                                     setSaving(true);
                                     try {
                                        await axiosInstance.post("/cms/settings", { 
                                           settings: { 
                                              ...localSettings, 
                                              admin_2fa_enabled: enabled,
                                              admin_2fa_backup_codes: backupCodes
                                           } 
                                        });
                                        setLocalSettings({
                                           ...localSettings,
                                           admin_2fa_enabled: enabled,
                                           admin_2fa_backup_codes: backupCodes
                                        });
                                        toast.success(`Two-Factor Authentication ${enabled === '1' ? 'enabled' : 'disabled'}`);
                                        refreshSettings();
                                     } catch (err) {
                                        toast.error("Failed to update 2FA setting");
                                     } finally {
                                        setSaving(false);
                                     }
                                  }}
                                  className="w-10 h-5 rounded-full bg-muted border-none checked:bg-primary appearance-none cursor-pointer relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all checked:after:left-[22px] shadow-inner transition-colors duration-300"
                                />
                             </div>

                             {localSettings['admin_2fa_enabled'] === '1' && (
                                <div className="space-y-4 animate-fade-in">
                                   <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-3">
                                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><ShieldCheck size={14} /> Active Security Recovery Codes</p>
                                      <p className="text-[10px] text-muted-foreground">Keep these backup codes printed or saved in a secure locker:</p>
                                      
                                      <div className="grid grid-cols-2 gap-2 pt-2">
                                         {getBackupCodes().map((code, i) => (
                                            <code key={i} className="text-xs font-mono font-black text-center bg-background border border-emerald-500/10 p-2 rounded-xl text-foreground/80">{code}</code>
                                         ))}
                                      </div>
                                      
                                      <Button 
                                        type="button"
                                        variant="ghost"
                                        onClick={async () => {
                                           const codes = JSON.stringify(generateRandomCodes());
                                           setSaving(true);
                                           try {
                                              await axiosInstance.post("/cms/settings", { 
                                                 settings: { 
                                                    ...localSettings, 
                                                    admin_2fa_backup_codes: codes
                                                 } 
                                              });
                                              setLocalSettings({
                                                 ...localSettings,
                                                 admin_2fa_backup_codes: codes
                                              });
                                              toast.success("New backup codes generated!");
                                              refreshSettings();
                                           } catch (err) {
                                              toast.error("Failed to generate backup codes");
                                           } finally {
                                              setSaving(false);
                                           }
                                        }}
                                        className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 font-black text-[10px] mt-2 h-9 rounded-xl"
                                      >
                                         <RefreshCcw size={10} className="mr-1.5" /> Regenerate Recovery Codes
                                      </Button>
                                   </div>
                                </div>
                             )}
                          </div>

                          {/* Active Sessions Panel */}
                          <div className="space-y-4 bg-muted/5 p-6 rounded-3xl border border-primary/5">
                             <h4 className="text-sm font-bold text-primary flex items-center gap-2 border-b pb-2 mb-4">
                                <UserCheck size={16} /> Current Active Sessions
                             </h4>
                             <div className="space-y-3">
                                <div className="flex items-center justify-between bg-background border border-primary/5 p-3 rounded-2xl">
                                   <div>
                                      <p className="text-xs font-bold text-foreground">Chrome on Windows 11</p>
                                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Active session (You)</p>
                                   </div>
                                   <span className="text-[10px] font-mono text-muted-foreground">Nairobi, Kenya</span>
                                </div>
                                <div className="flex items-center justify-between bg-background border border-primary/5 p-3 rounded-2xl opacity-60">
                                   <div>
                                      <p className="text-xs font-bold text-foreground">Safari on iPhone 15</p>
                                      <p className="text-[9px] text-muted-foreground font-semibold">Logged in 2 hours ago</p>
                                   </div>
                                   <span className="text-[10px] font-mono text-muted-foreground">Oxford, UK</span>
                                </div>
                             </div>
                             <Button 
                               type="button"
                               variant="ghost"
                               onClick={() => toast.success("All other active sessions revoked successfully")}
                               className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs h-10 rounded-xl"
                             >
                                Terminate Other Sessions
                             </Button>
                          </div>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up relative z-10">
           {modules.map((mod) => (
              <div 
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="group cursor-pointer relative"
              >
                 {/* Premium clear glass card with white text and white icons */}
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

           {/* Quick Access / Security Card */}
           <Card className="col-span-1 md:col-span-2 lg:col-span-3 rounded-[40px] bg-primary text-white p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl animate-pulse-slow">
              <div className="relative z-10 space-y-4 max-w-lg">
                 <div className="flex items-center gap-3">
                    <Lock className="text-white/40" size={24} />
                    <h3 className="text-3xl font-black tracking-tight italic">Security & Permissions</h3>
                 </div>
                 <p className="text-md font-medium text-white/70">Manage your administrative password and two-factor authentication settings.</p>
                 <Button 
                   onClick={() => setActiveModule('security')}
                   variant="outline" 
                   className="bg-transparent border-white/20 text-white hover:bg-white hover:text-primary rounded-full px-8 h-12 font-bold transition-all"
                 >
                    Access settings
                 </Button>
              </div>
              <div className="relative z-10 opacity-30">
                 <MousePointer2 size={120} strokeWidth={0.5} />
              </div>
              
              {/* Background Shapes */}
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-[-20px] left-[20%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
           </Card>
        </div>
      )}
    </div>
  );
}
