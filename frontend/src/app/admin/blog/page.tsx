"use client";
import React, { useEffect, useState } from "react";
import DashboardHero from "@/components/DashboardHero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Plus, Trash2, Edit, Calendar, Image as ImageIcon, X, Save, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/Textarea";
import { Dialog } from "@/components/ui/dialog";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import FilePondUploader from "@/components/admin/FilePondUploader";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogManagementPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/cms/blog");
      setData(res.data);
    } catch (e) {
      toast.error("Failed to fetch blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      content: '',
      status: 'draft',
      image_path: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost({ ...post });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingPost.title || !editingPost.content) {
      toast.error("Title and Content are required");
      return;
    }

    setSaving(true);
    try {
      if (editingPost.id) {
        await axiosInstance.put(`/cms/blog/${editingPost.id}`, editingPost);
        toast.success("Post updated");
      } else {
        await axiosInstance.post("/cms/blog", editingPost);
        toast.success("Post created");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await axiosInstance.delete(`/cms/blog/${id}`);
      toast.success("Post deleted");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 pb-20 animate-pulse">
         <div className="flex justify-between items-end">
            <div className="h-44 bg-muted/40 rounded-2xl border p-8 space-y-4 flex-1 mr-6">
               <Skeleton variant="text" className="w-48 h-8" />
               <Skeleton variant="text" className="w-96 h-5" />
            </div>
            <Skeleton variant="rect" className="w-44 h-12 rounded-full mb-10" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton variant="card" className="h-[420px] rounded-3xl" />
            <Skeleton variant="card" className="h-[420px] rounded-3xl" />
            <Skeleton variant="card" className="h-[420px] rounded-3xl" />
         </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <DashboardHero 
          title="Blog Management" 
          description="Manage your articles and published insights." 
        />
        <Button onClick={handleCreateNew} className="rounded-full px-8 h-12 shadow-lg shadow-primary/20 mb-10">
           <Plus className="mr-2" size={18} /> New article
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.length > 0 ? data.map((post) => (
          <Card key={post.id} className="rounded-3xl border shadow-sm hover:translate-y-[-4px] transition-all overflow-hidden bg-card group">
            <div className="aspect-video bg-muted relative overflow-hidden">
               {post.image_path ? (
                 <img src={post.image_path} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ImageIcon size={48} />
                 </div>
               )}
               <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white shadow-xl'}`}>
                    {post.status}
                  </span>
               </div>
            </div>
            
            <CardContent className="p-6 space-y-4">
               <div>
                  <h3 className="text-lg font-bold line-clamp-2 mb-1">{post.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 uppercase tracking-tight">
                    <Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}
                  </p>
               </div>

               <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 italic">
                  {post.excerpt}
               </p>

               <div className="pt-4 border-t flex gap-2">
                  <Button onClick={() => handleEdit(post)} variant="outline" className="flex-1 rounded-xl h-10 text-[11px] font-bold">
                     <Edit size={14} className="mr-2" /> Edit
                  </Button>
                  <Button onClick={() => deletePost(post.id)} variant="ghost" className="rounded-xl h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 p-0 flex items-center justify-center">
                     <Trash2 size={16} />
                  </Button>
               </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
             <Card className="rounded-3xl border-dashed border-2 p-20 text-center">
                <p className="text-muted-foreground font-medium italic">No articles published yet.</p>
             </Card>
          </div>
        )}
      </div>

      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        maxWidth="4xl"
        title={editingPost?.id ? 'Edit Article' : 'Compose New Article'}
      >
          <div className="space-y-8 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Article Title</label>
                      <Input 
                        value={editingPost?.title || ''}
                        onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                        placeholder="Enter catchy headline..."
                        className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6 text-lg"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Short Excerpt</label>
                      <Textarea 
                        rows={3}
                        value={editingPost?.excerpt || ''}
                        onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                        placeholder="Brief summary for list view..."
                        className="rounded-2xl bg-muted/30 border-none font-medium px-6 py-4 text-sm"
                      />
                   </div>

                   <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Status</label>
                         <select 
                            value={editingPost?.status || 'draft'}
                            onChange={(e) => setEditingPost({...editingPost, status: e.target.value})}
                            className="w-full h-12 bg-muted/30 rounded-xl px-4 text-sm font-bold border-none outline-none"
                         >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                         </select>
                      </div>
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Published Date</label>
                         <Input 
                            type="date"
                            value={editingPost?.published_at?.split('T')[0] || ''}
                            onChange={(e) => setEditingPost({...editingPost, published_at: e.target.value})}
                            className="h-12 bg-muted/30 rounded-xl border-none font-bold"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Featured Image</label>
                   <FilePondUploader 
                      uploadKey="blog_image"
                      label="Upload post image"
                      onSuccess={(url) => setEditingPost({...editingPost, image_path: url})}
                      onProcessFile={() => setSaving(true)}
                      onProcessFileEnd={() => setSaving(false)}
                   />
                   {editingPost?.image_path && (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border">
                         <img src={editingPost.image_path} className="w-full h-full object-cover" />
                         <Button onClick={() => setEditingPost({...editingPost, image_path: ''})} className="absolute top-2 right-2 w-8 h-8 rounded-full p-0 bg-red-500 text-white" size="sm">
                            <X size={14} />
                         </Button>
                      </div>
                   )}
                </div>
             </div>

             <div className="space-y-2 pt-4 border-t">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-1">Article Content</label>
                <Textarea 
                  rows={15}
                  value={editingPost?.content || ''}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                  placeholder="Tell your story..."
                  className="rounded-[32px] bg-muted/30 border-none font-medium p-8 leading-relaxed text-lg"
                />
             </div>

             <div className="flex justify-end gap-3 pt-6">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 h-12 font-bold">Cancel</Button>
                <Button onClick={handleSave} disabled={saving} className="rounded-xl px-12 h-12 font-black shadow-xl shadow-primary/20">
                   {saving ? <RefreshCcw className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                   {editingPost?.id ? 'Update Article' : 'Post Article'}
                </Button>
             </div>
          </div>
      </Dialog>
    </div>
  );
}
