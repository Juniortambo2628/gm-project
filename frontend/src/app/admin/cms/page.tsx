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
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import DashboardHero from "@/components/DashboardHero";
import axiosInstance from "@/lib/axios";
import { useCMS } from "@/context/SettingContext";
import FilePondUploader from "@/components/admin/FilePondUploader";

export default function CMSPage() {
  const { settings, refreshSettings, isLoading: cmsLoading } = useCMS();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

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

  if (cmsLoading) return <div className="p-12 text-center">Loading Settings Hub...</div>;

  const modules = [
    { 
      id: 'branding', 
      title: 'Brand Identity', 
      icon: ShieldCheck, 
      desc: 'Site name, contact email, and official URLs.',
      fields: ['site_name', 'contact_email', 'linkedin_url', 'logo_light', 'logo_dark', 'favicon'],
      bg: 'bg-blue-500/5'
    },
    { 
      id: 'hero', 
      title: 'Hero & Backgrounds', 
      icon: Layout, 
      desc: 'Headlines, service boxes, and page hero backgrounds.',
      fields: ['hero_headline', 'hero_tagline', 'hero_background_path', 'mba_hero_bg', 'consulting_hero_bg', 'homepage_mba_desc', 'homepage_consulting_desc'],
      bg: 'bg-amber-500/5'
    },
    { 
      id: 'seo', 
      title: 'Global SEO', 
      icon: Globe, 
      desc: 'How your site appears on Google.',
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
      fields: ['mba_headline', 'mba_description', 'consulting_headline', 'consulting_description'],
      bg: 'bg-indigo-500/5'
    }
  ];

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      <DashboardHero 
        title="Website CMS Hub" 
        description="Select a module to manage its content." 
      />

      {activeModule ? (
        <div className="space-y-8 animate-slide-up">
           <Button 
            variant="ghost" 
            onClick={() => setActiveModule(null)}
            className="group text-muted-foreground hover:text-primary font-bold transition-all px-0"
           >
              <ArrowRight className="rotate-180 mr-2 group-hover:mr-4 transition-all" size={16} />
              Back to Hub
           </Button>

           <Card className="rounded-[24px] border border-primary/10 shadow-xl overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between bg-muted/10">
                 <div>
                    <h3 className="text-xl font-black capitalize tracking-tight text-foreground">
                       {activeModule.replace('_', ' ')} Settings
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground italic">Edit settings and click save to apply changes.</p>
                 </div>
                 <Button onClick={handleSaveSettings} disabled={saving} className="rounded-full px-8 h-12 font-black">
                    {saving ? <RefreshCcw className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                    Apply Changes
                 </Button>
              </div>
              
              <CardContent className="p-6 md:p-8 max-w-5xl mx-auto space-y-10">
                 {activeModule === 'branding' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                        <div className="space-y-3 md:col-span-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">LinkedIn URL</label>
                           <Input 
                             value={localSettings['linkedin_url'] || ''} 
                             onChange={(e) => setLocalSettings({...localSettings, linkedin_url: e.target.value})}
                             className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6" 
                           />
                        </div>

                        <div className="pt-6 border-t border-border space-y-6 md:col-span-2">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                           </div>
                           <div className="max-w-xs mx-auto">
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
                    <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                        <div className="pt-6 border-t border-border space-y-8">
                           <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 mb-4 block">Homepage Hero Background</label>
                              <FilePondUploader 
                                uploadKey="hero_background_path"
                                label="Landing page background (Image/Video)"
                                onSuccess={(url) => setLocalSettings({...localSettings, hero_background_path: url})}
                                onProcessFile={() => setSaving(true)}
                                onProcessFileEnd={() => setSaving(false)}
                                acceptedFileTypes={['image/*', 'video/*']}
                              />
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <FilePondUploader 
                                uploadKey="mba_hero_bg"
                                label="MBA Admissions Hero Background"
                                onSuccess={(url) => setLocalSettings({...localSettings, mba_hero_bg: url})}
                                onProcessFile={() => setSaving(true)}
                                onProcessFileEnd={() => setSaving(false)}
                                acceptedFileTypes={['image/*', 'video/*']}
                              />
                              <FilePondUploader 
                                uploadKey="consulting_hero_bg"
                                label="Consulting Prep Hero Background"
                                onSuccess={(url) => setLocalSettings({...localSettings, consulting_hero_bg: url})}
                                onProcessFile={() => setSaving(true)}
                                onProcessFileEnd={() => setSaving(false)}
                                acceptedFileTypes={['image/*', 'video/*']}
                              />
                           </div>
                        </div>
                    </div>
                 )}

                 {activeModule === 'seo' && (
                    <div className="space-y-10">
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
                            rows={4}
                            value={localSettings['meta_description'] || ''} 
                            onChange={(e) => setLocalSettings({...localSettings, meta_description: e.target.value})}
                            className="rounded-2xl bg-muted/30 border-none font-medium p-6" 
                          />
                       </div>
                    </div>
                 )}

                 {activeModule === 'about' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
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
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1 mb-2 block">Portrait Image</label>
                              <FilePondUploader 
                                uploadKey="about_portrait_path"
                                label="About portrait"
                                onSuccess={(url) => setLocalSettings({...localSettings, about_portrait_path: url})}
                                onProcessFile={() => setSaving(true)}
                                onProcessFileEnd={() => setSaving(false)}
                              />
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Headline</label>
                              <Input 
                                value={localSettings['african_coach_headline'] || ''} 
                                onChange={(e) => setLocalSettings({...localSettings, african_coach_headline: e.target.value})}
                                className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">African Advantage Text</label>
                              <Textarea 
                                rows={4}
                                value={localSettings['african_coach_description'] || ''} 
                                onChange={(e) => setLocalSettings({...localSettings, african_coach_description: e.target.value})}
                                className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 pt-6 border-t border-border">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Credentials JSON</label>
                              <p className="text-[10px] text-muted-foreground mb-2">Enter credentials as JSON array (icon, title, subtitle, desc)</p>
                              <Textarea 
                                rows={6}
                                value={localSettings['credentials_json'] || ''} 
                                onChange={(e) => setLocalSettings({...localSettings, credentials_json: e.target.value})}
                                className="rounded-xl bg-muted/30 border-none font-mono p-4 text-xs" 
                              />
                           </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border">
                           <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Narrative Biography (Full)</label>
                           <Textarea 
                             rows={8}
                             value={localSettings['about_bio_full'] || ''} 
                             onChange={(e) => setLocalSettings({...localSettings, about_bio_full: e.target.value})}
                             className="rounded-2xl bg-muted/30 border-none font-medium p-6 leading-relaxed" 
                           />
                        </div>
                    </div>
                 )}

                 {activeModule === 'services_content' && (
                    <div className="space-y-8">
                        <div className="space-y-6">
                           <h4 className="text-sm font-bold text-primary border-b pb-2">MBA Page</h4>
                           <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Headline</label>
                                 <Input 
                                   value={localSettings['mba_headline'] || ''} 
                                   onChange={(e) => setLocalSettings({...localSettings, mba_headline: e.target.value})}
                                   className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" 
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">MBA Description</label>
                                 <Textarea 
                                   rows={3}
                                   value={localSettings['mba_description'] || ''} 
                                   onChange={(e) => setLocalSettings({...localSettings, mba_description: e.target.value})}
                                   className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t">
                           <h4 className="text-sm font-bold text-primary border-b pb-2">Consulting Page</h4>
                           <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Headline</label>
                                 <Input 
                                   value={localSettings['consulting_headline'] || ''} 
                                   onChange={(e) => setLocalSettings({...localSettings, consulting_headline: e.target.value})}
                                   className="h-12 rounded-xl bg-muted/30 border-none font-bold px-6" 
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Consulting Description</label>
                                 <Textarea 
                                   rows={3}
                                   value={localSettings['consulting_description'] || ''} 
                                   onChange={(e) => setLocalSettings({...localSettings, consulting_description: e.target.value})}
                                   className="rounded-xl bg-muted/30 border-none font-medium p-4" 
                                 />
                              </div>
                           </div>
                        </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-slide-up">
           {modules.map((mod) => (
              <div 
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="group cursor-pointer relative"
              >
                 <Card className="h-full rounded-[40px] border-none shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:translate-y-[-12px] bg-white overflow-hidden p-8 flex flex-col items-center text-center gap-6">
                    <div className={`w-24 h-24 ${mod.bg} rounded-[32px] flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                       <mod.icon size={44} strokeWidth={1.5} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black mb-2 text-foreground tracking-tight">{mod.title}</h3>
                       <p className="text-[13px] font-medium text-muted-foreground leading-relaxed px-2">{mod.desc}</p>
                    </div>
                    <div className="mt-auto pt-6 w-full">
                       <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight size={20} />
                       </div>
                    </div>
                 </Card>
              </div>
           ))}

           {/* Quick Access / Misc Settings */}
           <Card className="col-span-1 md:col-span-2 lg:col-span-4 rounded-[40px] bg-primary text-white p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="relative z-10 space-y-4 max-w-lg">
                 <div className="flex items-center gap-3">
                    <Lock className="text-white/40" size={24} />
                    <h3 className="text-3xl font-black tracking-tight italic">Security & Permissions</h3>
                 </div>
                 <p className="text-md font-medium text-white/70">Manage your administrative password and two-factor authentication settings.</p>
                 <Button variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white hover:text-primary rounded-full px-8 h-12 font-bold transition-all">
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
