"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCMS } from "@/context/SettingContext";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBlock } from "@/components/ui/IconBlock";
import { PageHero } from "@/components/PageHero";

export default function BlogListingPage() {
  const { blog_posts, getSetting } = useCMS();

  const breadcrumbs = [
    { label: "Blog" }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <SiteHeader />

      <PageHero 
        title={getSetting('blog_hero_title', "Insights and resources")}
        subtitle={getSetting('blog_hero_subtitle', "Personal reflections on Oxford, McKinsey, and the journey of African professionals in the global arena.")}
        badge="Knowledge hub"
        breadcrumbs={breadcrumbs}
        videoSrc={getSetting('blog_hero_bg') || "/hero-bg.mp4"}
      />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {blog_posts.length > 0 ? (
            blog_posts.map((post, i) => (
              <div key={i} className="group bg-card border-2 border-border rounded-3xl overflow-hidden hover:border-primary/30 transition-all flex flex-col shadow-sm hover:shadow-2xl hover:shadow-primary/5 translate-y-0 hover:-translate-y-1 duration-500">
                 <div className="aspect-[16/9] relative overflow-hidden">
                    <img 
                      src={post.image_path || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000"} 
                      alt={post.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 flex gap-2">
                       <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold rounded-full">Resources</span>
                    </div>
                 </div>
                 <div className="p-8 md:p-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground mb-4 opacity-70">
                       <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-primary" />
                          {new Date(post.published_at).toLocaleDateString()}
                       </div>
                       <div className="flex items-center gap-2">
                          <User size={12} className="text-primary" />
                          Gathoni Mwai
                       </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                       {post.title}
                    </h3>
                    <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-3">
                       {post.excerpt}
                    </p>
                    <div className="mt-auto pt-6 border-t border-border">
                       <Link href={`/blog/${post.slug}`}>
                          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent text-primary font-bold text-[11px] flex items-center gap-3">
                             Read full article <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                          </Button>
                       </Link>
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
               <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 opacity-40">
                  <BookOpen size={48} className="text-primary" />
               </div>
               <h3 className="text-3xl font-bold text-muted-foreground/60">Coming soon</h3>
               <p className="text-xl text-muted-foreground/40 font-medium max-w-sm mx-auto mt-4 leading-relaxed">
                  I'm currently busy with my Oxford MBA. Check back soon for new articles and resources.
               </p>
               <div className="mt-12">
                  <Link href="/contact">
                     <Button variant="outline" className="h-14 px-10 rounded-full font-bold text-xs border-primary/20 text-primary hover:bg-primary/5">
                        Notify me
                     </Button>
                  </Link>
               </div>
            </div>
          )}
        </div>

        {/* Featured Quote / Mid-section */}
        <div className="mt-32 p-10 lg:p-20 bg-primary text-white rounded-3xl relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <BookOpen size={180} />
           </div>
           <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl lg:text-4xl font-bold mb-8 italic">"Empowering the next generation of African leaders is not just a mission, it's a responsibility."</h2>
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img src="/about-professional-portrait-red-bg.png" alt="Gathoni" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-lg font-bold">Gathoni Mwai</p>
                    <p className="text-white/60 font-bold text-[10px]">Oxford MBA '26</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
