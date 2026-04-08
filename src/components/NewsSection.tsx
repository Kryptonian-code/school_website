import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Calendar } from "lucide-react";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const NewsSection = () => {
  const { data } = useSiteContent();
  const posts = (data?.posts ?? []).slice(0, 3);

  return (
    <section id="news" className="section-padding bg-background">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Latest News</p>
            <h2 className="section-title">News & Events</h2>
            <p className="section-subtitle mx-auto">
              Stay updated with the latest happenings, achievements, and announcements from our school community.
            </p>
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <PublicEmptyState
            title="School news will appear here soon"
            description="New achievements, events, and campus updates will be published here once the newsroom is updated."
            actionLabel="Browse the public site"
            actionHref="/#home"
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={index * 100}>
                <article className="bg-card rounded-xl border border-border overflow-hidden card-hover group h-full flex flex-col">
                  {post.featured_image_url ? (
                    <img src={post.featured_image_url} alt={post.title} className="h-48 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-48 gradient-navy flex items-center justify-center">
                      <span className="text-primary-foreground/30 font-heading text-5xl font-bold">PA</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-secondary bg-gold-light rounded-full px-2.5 py-0.5">
                        {post.category || "News"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.published_at ? format(new Date(post.published_at), "dd MMM yyyy") : format(new Date(post.created_at), "dd MMM yyyy")}
                      </span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
                      {post.excerpt || post.content || "Read the latest update from our school."}
                    </p>
                    <Link to={`/news/${post.slug}`} className="inline-flex items-center text-sm font-medium text-primary">
                      Read Story <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal>
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/news">Browse All Stories</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default NewsSection;
