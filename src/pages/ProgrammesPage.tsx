import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { PaginationMeta, Programme } from "@/types/content";

const emptyPagination: PaginationMeta = { page: 1, limit: 9, total: 0, page_count: 1 };

const ProgrammesPage = () => {
  const { data } = useSiteContent();
  const schoolName = data?.settings.school_name || "Prestige Academy";
  const [searchParams, setSearchParams] = useSearchParams();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
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
    api.getPublicProgrammes({ page, limit: 9, search: query })
      .then((response) => {
        setProgrammes(response.items);
        setPagination(response.pagination);
        if (response.pagination.page_count > 0 && page > response.pagination.page_count) {
          const next = new URLSearchParams(searchParams);
          next.set("page", String(response.pagination.page_count));
          setSearchParams(next, { replace: true });
        }
      })
      .catch(() => {
        setProgrammes([]);
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
        title={`Programmes | ${schoolName}`}
        description={`Explore the academic pathways available at ${schoolName}, from early years through senior high.`}
        canonicalPath="/programmes"
        siteName={schoolName}
        keywords={["school programmes", "academic pathways", schoolName]}
      />
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Programmes</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Academic Pathways for Every Stage</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl">
            Explore the full learning journey from early years to senior high, with each programme designed to help students grow with confidence.
          </p>
        </div>
      </section>

      <section className="section-padding bg-warm-gray">
        <div className="section-container">
          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Search programmes</p>
              <p className="text-sm text-muted-foreground">Find a class stage or age band quickly.</p>
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
                  placeholder="Search programmes..."
                />
              </div>
              <Button onClick={applySearch}>Search</Button>
            </div>
          </div>
          {loading ? (
            <PublicEmptyState
              title="Loading programmes..."
              description="Fetching the latest academic pathways and class-stage details."
            />
          ) : programmes.length === 0 ? (
            <PublicEmptyState
              title={query ? "No programmes matched your search" : "No programmes have been published yet"}
              description={query ? "Try another keyword or contact admissions for help choosing the right class stage." : "The academic catalogue is currently being updated. Please contact admissions for the latest available year groups and entry options."}
              actionLabel="Contact admissions"
            />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {programmes.map((programme) => (
                <article key={programme.id} className={`rounded-2xl border p-6 shadow-sm h-full ${programme.theme_color}`}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-medium text-muted-foreground bg-background/60 rounded-full px-3 py-1">
                      {programme.age_group || "All ages"}
                    </span>
                    <span className="text-xs text-muted-foreground">{programme.duration || "Flexible"}</span>
                  </div>
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-3">{programme.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {programme.short_description || programme.full_description}
                  </p>
                  <Link to={`/programmes/${programme.slug}`} className="inline-flex items-center text-sm font-medium text-primary">
                    View programme <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
          {pagination.page_count > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.max(1, page - 1)));
                setSearchParams(next);
              }}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.page_count}</span>
              <Button variant="outline" disabled={page >= pagination.page_count} onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.min(pagination.page_count, page + 1)));
                setSearchParams(next);
              }}>Next</Button>
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProgrammesPage;
