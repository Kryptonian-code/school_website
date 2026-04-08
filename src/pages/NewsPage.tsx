import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Search } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { BlogPost, PaginationMeta } from "@/types/content";

const emptyPagination: PaginationMeta = { page: 1, limit: 6, total: 0, page_count: 1 };

const NewsPage = () => {
  const { data } = useSiteContent();
  const schoolName = data?.settings.school_name || "Prestige Academy";
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    api.getPublicBlogPosts({ page, limit: 6, search: query })
      .then((response) => {
        setPosts(response.items);
        setPagination(response.pagination);
        if (response.pagination.page_count > 0 && page > response.pagination.page_count) {
          const next = new URLSearchParams(searchParams);
          next.set("page", String(response.pagination.page_count));
          setSearchParams(next, { replace: true });
        }
      })
      .catch(() => {
        setPosts([]);
        setPagination(emptyPagination);
      })
      .finally(() => setLoading(false));
  }, [page, query, searchParams, setSearchParams]);

  const applySearch = () => {
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set("q", searchInput.trim());
    } else {
      next.delete("q");
    }
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`News & Events | ${schoolName}`}
        description={`Read the latest school updates, achievements, and event announcements from ${schoolName}.`}
        canonicalPath="/news"
        siteName={schoolName}
        keywords={["school news", "school events", "school announcements", schoolName]}
      />
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">News & Events</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Latest Stories from the School Community</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl">
            Follow achievements, campus updates, and important announcements from across the school.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Search stories</p>
              <p className="text-sm text-muted-foreground">Filter announcements, events, and school updates.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative min-w-[16rem]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applySearch();
                    }
                  }}
                  className="pl-10"
                  placeholder="Search news..."
                />
              </div>
              <Button onClick={applySearch}>Search</Button>
            </div>
          </div>
          {loading ? (
            <PublicEmptyState
              title="Loading stories..."
              description="Fetching the latest published news and event updates."
              actionLabel="Return home"
              actionHref="/"
            />
          ) : posts.length === 0 ? (
            <PublicEmptyState
              title={query ? "No stories matched your search" : "No news stories have been published yet"}
              description={query ? "Try a different keyword to find a story or update." : "School updates and event announcements will appear here once the content team publishes them."}
              actionLabel="Return home"
              actionHref="/"
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  {post.featured_image_url ? (
                    <img src={post.featured_image_url} alt={post.title} className="h-52 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="gradient-navy flex h-52 items-center justify-center">
                      <span className="font-heading text-5xl font-bold text-primary-foreground/30">PA</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 text-xs text-muted-foreground">
                      {post.category || "News"} • {format(new Date(post.published_at || post.created_at), "dd MMM yyyy")}
                    </div>
                    <h2 className="mb-3 font-heading text-xl font-semibold text-foreground">{post.title}</h2>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt || post.content}
                    </p>
                    <Link to={`/news/${post.slug}`} className="text-sm font-medium text-primary">Read full story</Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination.page_count > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page === 1} onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.max(1, page - 1)));
                setSearchParams(next);
              }}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.page_count}</span>
              <Button variant="outline" disabled={page === pagination.page_count} onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.min(pagination.page_count, page + 1)));
                setSearchParams(next);
              }}>Next</Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default NewsPage;
