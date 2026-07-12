import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getBlogPost } from "@/lib/api";
import { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return {
    title: post ? `${post.title} | Gathoni Mwai` : "Article not found",
    description: post?.excerpt || "",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Blog", path: "/blog" },
    { label: post.title }
  ];

  return (
    <PublicLayout
      hero={{
        title: post.title,
        subtitle: post.excerpt,
        badge: "Article",
        breadcrumbs,
        videoSrc: "/hero-bg.mp4"
      }}
    >
      <main className="max-w-4xl mx-auto px-6 py-16">
        {post.image_path && (
          <div className="aspect-[16/9] relative rounded-3xl overflow-hidden mb-12 shadow-2xl">
            <Image
              src={post.image_path}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground mb-8 opacity-70">
          <div className="flex items-center gap-2">
            <Calendar size={12} className="text-primary" />
            {post.published_at ? new Date(post.published_at).toLocaleDateString() : post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Draft'}
          </div>
          <div className="flex items-center gap-2">
            <User size={12} className="text-primary" />
            Gathoni Mwai
          </div>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div
            className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div className="mt-16 pt-10 border-t border-border">
          <Link href="/blog">
            <Button variant="outline" className="rounded-full font-bold text-xs">
              <ArrowLeft size={14} className="mr-2" /> Back to all articles
            </Button>
          </Link>
        </div>
      </main>
    </PublicLayout>
  );
}
