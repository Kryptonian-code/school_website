import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { BlogPost } from "@/types/content";

const NewsPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useSiteContent();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getPublicBlogPost(slug).then((response) => setPost(response.item)).catch(() => setPost(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-24 text-center">
          <p className="text-muted-foreground">Loading story...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-24 text-center">
          <h1 className="font-heading font-bold text-3xl mb-4">Story Not Found</h1>
          <Button asChild variant="outline">
            <Link to="/news"><ArrowLeft className="mr-2 h-4 w-4" /> Back to News</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const schoolName = data?.settings.school_name || "Prestige Academy";
  const description = post.meta_description || post.excerpt || "Read the latest update from the school community.";
  const publishedAt = post.published_at || post.created_at;
  const articleData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description,
    datePublished: publishedAt,
    dateModified: publishedAt,
    image: post.featured_image_url ? [new URL(post.featured_image_url, window.location.origin).toString()] : undefined,
    author: {
      "@type": "Organization",
      name: schoolName,
    },
    publisher: {
      "@type": "Organization",
      name: schoolName,
    },
    mainEntityOfPage: new URL(`/news/${post.slug}`, window.location.origin).toString(),
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`${post.title} | ${schoolName}`}
        description={description}
        canonicalPath={`/news/${post.slug}`}
        image={post.featured_image_url || undefined}
        siteName={schoolName}
        type="article"
        publishedTime={publishedAt}
        modifiedTime={publishedAt}
        keywords={[post.category || "School news", post.title, schoolName]}
      />
      <StructuredData id={`news-${post.slug}`} data={articleData} />
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <Link to="/news" className="inline-flex items-center text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
          </Link>
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">{post.category || "News"}</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">{post.title}</h1>
          <p className="text-primary-foreground/70">{format(new Date(post.published_at || post.created_at), "dd MMM yyyy")}</p>
        </div>
      </section>

      <article className="section-padding">
        <div className="section-container max-w-4xl">
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
            <p>{post.content}</p>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default NewsPostPage;
