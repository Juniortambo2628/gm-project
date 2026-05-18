"use client";
import React, { useEffect, useState } from "react";
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Trash2, Save, RefreshCcw, Monitor, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import axiosInstance from "@/lib/axios";
import { useCMS } from "@/context/SettingContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesManagementPage() {
  const { settings, services, refreshSettings, isLoading: cmsLoading } = useCMS();
  const [localServices, setLocalServices] = useState<any[]>([]);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cmsLoading) {
      setLocalServices(services || []);
      setLocalSettings(settings || {});
    }
  }, [cmsLoading, services, settings]);

  const handleSaveService = async (service: any) => {
    setSaving(true);
    try {
      await axiosInstance.post("/cms/services", service);
      toast.success("Service updated");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await axiosInstance.post("/cms/settings", { settings: localSettings });
      toast.success("Settings updated");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    setSaving(true);
    try {
      await axiosInstance.delete(`/cms/services/${id}`);
      toast.success("Service deleted");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to delete service");
    } finally {
      setSaving(false);
    }
  };

  if (cmsLoading) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
         <div className="flex justify-between items-end">
            <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4 flex-1 mr-6">
               <Skeleton variant="text" className="w-48 h-8" />
               <Skeleton variant="text" className="w-96 h-5" />
            </div>
            <Skeleton variant="rect" className="w-48 h-12 rounded-full mb-10" />
         </div>
         <div className="grid grid-cols-1 gap-8">
            <Skeleton variant="card" className="h-64 rounded-3xl" />
            <Skeleton variant="card" className="h-64 rounded-3xl" />
         </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <DashboardHero 
          title="Service Packages" 
          description="Manage your MBA Admissions and Consulting Interview packages." 
        />
        <Button onClick={() => setLocalServices([{ name: '', price: 0, type: 'mba', features: [], description: '', is_active: true, duration: '60 Min' }, ...localServices])} className="rounded-full px-8 h-12 shadow-lg shadow-primary/20 mb-10">
           <Plus className="mr-2" size={18} /> Add new package
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="rounded-[32px] border-none shadow-xl bg-primary text-white overflow-hidden p-10 relative">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Calendar size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black italic">Discovery Call Configuration</h3>
                    <p className="text-white/60 text-xs font-medium">Manage the global settings for your free discovery sessions.</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Calendly Event URL</label>
                    <Input 
                      value={localSettings['discovery_calendly_url'] || ''} 
                      onChange={(e) => setLocalSettings({...localSettings, discovery_calendly_url: e.target.value})}
                      className="h-14 bg-white/10 border-none rounded-2xl font-bold px-6 text-white placeholder:text-white/20" 
                      placeholder="https://calendly.com/..."
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Call Duration Label</label>
                    <Input 
                      value={localSettings['discovery_duration'] || '20 Min'} 
                      onChange={(e) => setLocalSettings({...localSettings, discovery_duration: e.target.value})}
                      className="h-14 bg-white/10 border-none rounded-2xl font-bold px-6 text-white" 
                    />
                 </div>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                disabled={saving} 
                className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 font-black transition-all active:scale-95"
              >
                 {saving ? <RefreshCcw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                 Save Discovery Settings
              </Button>
           </div>
           <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 translate-x-1/4 -translate-y-1/4">
              <Monitor size={240} />
           </div>
        </Card>

        {localServices.length > 0 ? localServices.map((service, i) => (
          <Card key={service.id || `new-${i}`} className="rounded-3xl border hover:border-primary/30 transition-all overflow-hidden bg-card">
            <div className="p-8 flex flex-col md:flex-row gap-10">
               <div className="flex-1 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Package name</label>
                        <Input 
                          value={service.name} 
                          onChange={(e) => {
                            const updated = [...localServices];
                            updated[i].name = e.target.value;
                            setLocalServices(updated);
                          }}
                          className="h-14 font-bold bg-muted/30 border-none rounded-2xl text-lg px-6" 
                          placeholder="e.g. Comprehensive MBA Package"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Price (USD)</label>
                           <Input 
                             type="number"
                             value={service.price} 
                             onChange={(e) => {
                               const updated = [...localServices];
                               updated[i].price = e.target.value;
                               setLocalServices(updated);
                             }}
                             className="h-14 font-bold bg-muted/30 border-none rounded-2xl text-xl px-6" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Category</label>
                           <select 
                             value={service.type}
                             onChange={(e) => {
                               const updated = [...localServices];
                               updated[i].type = e.target.value;
                               setLocalServices(updated);
                             }}
                             className="h-14 w-full bg-muted/30 rounded-2xl px-6 text-sm font-bold border-none outline-none appearance-none"
                           >
                              <option value="mba">MBA Coaching</option>
                              <option value="consulting">Consulting Prep</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Features (One per line)</label>
                     <Textarea 
                       value={service.features.join('\n')}
                       onChange={(e) => {
                         const updated = [...localServices];
                         updated[i].features = e.target.value.split('\n');
                         setLocalServices(updated);
                       }}
                       className="min-h-32 bg-muted/30 border-none rounded-2xl p-6 font-medium leading-relaxed" 
                       placeholder="List the service features here..."
                     />
                  </div>
               </div>

               <div className="md:w-56 flex flex-col gap-3 justify-center border-l pl-10 border-border">
                  <Button disabled={saving} onClick={() => handleSaveService(service)} className="w-full h-12 rounded-xl shadow-lg shadow-primary/10">
                     {saving ? <RefreshCcw className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                     Save changes
                  </Button>
                  <Button variant="ghost" disabled={saving} onClick={() => handleDeleteService(service.id)} className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold">
                     <Trash2 size={16} className="mr-2" /> Delete
                  </Button>
               </div>
            </div>
          </Card>
        )) : (
          <Card className="rounded-3xl border-dashed border-2 p-20 text-center">
             <p className="text-muted-foreground font-medium italic">No service packages found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
