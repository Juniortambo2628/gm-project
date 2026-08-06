"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Mail, Trash2, Calendar, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Message } from "@/lib/api";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function InquiriesPage() {
  const { data: inquiries, loading, refetch } = useAdminFetch<Message[]>("/cms/inquiries", {
    errorMessage: "Failed to fetch inquiries",
  });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const deleteInquiry = async (id: number) => {
    try {
      await axiosInstance.delete(`/cms/inquiries/${id}`);
      toast.success("Inquiry deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <AdminListPage title="Client Inquiries" description="Manage messages from your website contact form." isLoading={loading}>
      <div className="grid grid-cols-1 gap-6">
        {inquiries.length > 0 ? inquiries.map((item) => (
          <Card key={item.id} className="rounded-3xl border shadow-sm hover:border-primary/20 transition-all overflow-hidden">
            <div className="p-8 flex flex-col md:flex-row gap-8">
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={18} />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{item.email}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                     <span className="flex items-center gap-1.5"><MapPin size={14} /> {item.country || 'N/A'}</span>
                     <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-2xl border-l-4 border-primary/20">
                     <p className="text-xs font-bold text-primary mb-2 italic">Subject: {item.subject}</p>
                      <p className="text-sm text-foreground font-medium leading-relaxed italic line-clamp-3">&ldquo;{item.content}&rdquo;</p>
                  </div>
               </div>
               
               <div className="md:w-48 flex flex-col gap-3 justify-center shrink-0">
                  <a href={`mailto:${item.email}`} className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-2">
                     <Mail size={16} /> Reply
                  </a>
                  <Button onClick={() => setDeleteTarget(item.id)} variant="ghost" className="w-full h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-[12px] font-bold">
                     <Trash2 size={16} className="mr-2" /> Delete
                  </Button>
               </div>
            </div>
          </Card>
        )) : (
          <EmptyState title="No messages found yet." />
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteInquiry(deleteTarget); }}
        title="Delete inquiry"
        description="Are you sure you want to delete this inquiry? This action cannot be undone."
      />
    </AdminListPage>
  );
}
