"use client";
import React, { useEffect, useState } from "react";
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, MessageSquare, Plus, Trash2, Save, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/lib/axios";
import { useCMS } from "@/context/SettingContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContentManagementPage() {
  const { faqs, testimonials, refreshSettings, isLoading: cmsLoading } = useCMS();
  const [localFaqs, setLocalFaqs] = useState<any[]>([]);
  const [localTestimonials, setLocalTestimonials] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cmsLoading) {
      setLocalFaqs(faqs || []);
      setLocalTestimonials(testimonials || []);
    }
  }, [cmsLoading, faqs, testimonials]);

  const handleSaveFaq = async (faq: any) => {
    setSaving(true);
    try {
      await axiosInstance.post("/cms/faqs", faq);
      toast.success("FAQ updated");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestimonial = async (t: any) => {
    setSaving(true);
    try {
      await axiosInstance.post("/cms/testimonials", t);
      toast.success("Testimonial updated");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (type: string, id: number) => {
    if (!confirm('Are you sure?')) return;
    setSaving(true);
    try {
      await axiosInstance.delete(`/cms/${type}/${id}`);
      toast.success("Item deleted");
      refreshSettings();
    } catch (e) {
      toast.error("Failed to delete item");
    } finally {
      setSaving(false);
    }
  };

  if (cmsLoading) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
         <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4">
            <Skeleton variant="text" className="w-48 h-8" />
            <Skeleton variant="text" className="w-96 h-5" />
         </div>
         <div className="h-14 w-64 bg-muted/50 rounded-2xl p-1 mb-10 flex gap-2">
            <Skeleton variant="rect" className="flex-1 h-full rounded-xl" />
            <Skeleton variant="rect" className="flex-1 h-full rounded-xl" />
         </div>
         <div className="space-y-6">
            <Skeleton variant="card" className="h-48 rounded-3xl" />
            <Skeleton variant="card" className="h-48 rounded-3xl" />
         </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <DashboardHero 
        title="Social Proof & FAQs" 
        description="Manage your customer reviews and frequently asked questions." 
      />

      <Tabs defaultValue="testimonials" className="w-full">
         <TabsList className="bg-muted/50 p-1 rounded-2xl mb-10 inline-flex">
            <TabsTrigger value="testimonials" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Testimonials</TabsTrigger>
            <TabsTrigger value="faqs" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">FAQ Database</TabsTrigger>
         </TabsList>

         <TabsContent value="testimonials" className="space-y-8 animate-slide-up">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h3 className="text-xl font-bold italic">Success Stories</h3>
                  <p className="text-xs text-muted-foreground font-medium">Stories that build trust with new clients.</p>
               </div>
               <Button onClick={() => setLocalTestimonials([{ client_name: '', client_role: '', content: '', tag: 'MBA Admissions' }, ...localTestimonials])} variant="outline" className="rounded-full">
                  <Plus className="mr-2" size={16}/> Add testimonial
               </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {localTestimonials.map((t, i) => (
                  <Card key={t.id || `t-${i}`} className="rounded-3xl border hover:border-primary/20 transition-all overflow-hidden bg-white shadow-sm group">
                     <div className="p-8 flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Input 
                                value={t.client_name} 
                                onChange={(e) => {
                                  const updated = [...localTestimonials];
                                  updated[i].client_name = e.target.value;
                                  setLocalTestimonials(updated);
                                }}
                                className="h-12 font-bold bg-muted/30 border-none rounded-xl px-6" 
                                placeholder="Client Name"
                              />
                              <Input 
                                value={t.client_role} 
                                onChange={(e) => {
                                  const updated = [...localTestimonials];
                                  updated[i].client_role = e.target.value;
                                  setLocalTestimonials(updated);
                                }}
                                className="h-12 bg-muted/30 border-none rounded-xl px-6" 
                                placeholder="Outcome / Firm"
                              />
                           </div>
                           <Textarea 
                             value={t.content}
                             onChange={(e) => {
                               const updated = [...localTestimonials];
                               updated[i].content = e.target.value;
                               setLocalTestimonials(updated);
                             }}
                             className="min-h-24 bg-muted/30 border-none rounded-xl font-medium leading-relaxed italic" 
                             placeholder='"The coaching was transformational..."'
                           />
                        </div>
                        <div className="md:w-48 flex flex-col gap-3 justify-center border-l pl-10 border-border">
                           <Button onClick={() => handleSaveTestimonial(t)} className="h-11 rounded-xl shadow-lg shadow-primary/5">Save</Button>
                           {t.id && (
                              <Button variant="ghost" onClick={() => handleDeleteItem('testimonials', t.id)} className="h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                 <Trash2 size={16} className="mr-2" /> Delete
                              </Button>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </TabsContent>

         <TabsContent value="faqs" className="space-y-8 animate-slide-up">
            <div className="flex justify-between items-center px-4">
               <div>
                  <h3 className="text-xl font-bold italic">Frequently Asked Questions</h3>
                  <p className="text-xs text-muted-foreground font-medium">Answer common questions to reduce friction.</p>
               </div>
               <Button onClick={() => setLocalFaqs([{ question: '', answer: '', category: 'MBA Admissions' }, ...localFaqs])} variant="outline" className="rounded-full">
                  <Plus className="mr-2" size={16}/> Add FAQ
               </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {localFaqs.map((faq, i) => (
                  <Card key={faq.id || `faq-${i}`} className="rounded-3xl border hover:border-primary/20 transition-all overflow-hidden bg-white shadow-sm">
                     <div className="p-8 flex flex-col md:flex-row gap-10">
                        <div className="flex-1 space-y-6">
                           <Input 
                             value={faq.question} 
                             onChange={(e) => {
                               const updated = [...localFaqs];
                               updated[i].question = e.target.value;
                               setLocalFaqs(updated);
                             }}
                             className="h-12 font-bold bg-muted/30 border-none rounded-xl px-6" 
                             placeholder="The Question..."
                           />
                           <Textarea 
                             value={faq.answer}
                             onChange={(e) => {
                               const updated = [...localFaqs];
                               updated[i].answer = e.target.value;
                               setLocalFaqs(updated);
                             }}
                             className="min-h-24 bg-muted/30 border-none rounded-xl font-medium" 
                             placeholder="The Answer..."
                           />
                        </div>
                        <div className="md:w-48 flex flex-col gap-3 justify-center border-l pl-10 border-border">
                           <Button onClick={() => handleSaveFaq(faq)} className="h-11 rounded-xl shadow-lg shadow-primary/5">Save</Button>
                           {faq.id && (
                              <Button variant="ghost" onClick={() => handleDeleteItem('faqs', faq.id)} className="h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                                 <Trash2 size={16} className="mr-2" /> Delete
                              </Button>
                           )}
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
