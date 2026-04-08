import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Building2, Mail, MapPin, Search } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/siteContent";
import type { CareerVacancy, PaginationMeta } from "@/types/content";

const emptyPagination: PaginationMeta = { page: 1, limit: 9, total: 0, page_count: 1 };

const CareersPage = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? defaultSiteSettings;
  const schoolName = settings.school_name || defaultSiteSettings.school_name;
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<CareerVacancy[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(emptyPagination);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";
  const department = searchParams.get("department") || "";
  const employmentType = searchParams.get("employment_type") || "";
  const rawPage = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    api.getPublicCareers({ page, limit: 9, search: query, department, employment_type: employmentType, hiring_status: "open" })
      .then((response) => {
        setItems(response.items);
        setDepartments(response.filters.departments);
        setEmploymentTypes(response.filters.employment_types);
        setPagination(response.pagination);
        if (response.pagination.page_count > 0 && page > response.pagination.page_count) {
          const next = new URLSearchParams(searchParams);
          next.set("page", String(response.pagination.page_count));
          setSearchParams(next, { replace: true });
        }
      })
      .catch(() => {
        setItems([]);
        setDepartments([]);
        setEmploymentTypes([]);
        setPagination(emptyPagination);
      })
      .finally(() => setLoading(false));
  }, [department, employmentType, page, query, searchParams, setSearchParams]);

  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set("q", searchInput.trim());
    } else {
      next.delete("q");
    }
    next.delete("page");
    setSearchParams(next);
  };

  const updateFilter = (key: "department" | "employment_type", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    setSearchParams(next);
  };

  const pageTitle = settings.careers_page_title || "Careers at Prestige Academy";
  const introText = settings.careers_intro_text || "Join a school community committed to excellent teaching, warm student support, and purposeful growth.";

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`${pageTitle} | ${schoolName}`}
        description={introText}
        canonicalPath="/careers"
        siteName={schoolName}
        keywords={["school careers", "teaching jobs", schoolName]}
      />
      <Header />

      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)] lg:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-secondary">Careers</p>
            <h1 className="mb-4 font-heading text-4xl font-extrabold md:text-5xl">{pageTitle}</h1>
            <p className="max-w-3xl text-lg leading-8 text-primary-foreground/75">{introText}</p>
          </div>
          <div className="rounded-[1.75rem] border border-primary-foreground/12 bg-primary-foreground/6 p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-xl font-bold">Now hiring</h2>
                <p className="text-sm leading-6 text-primary-foreground/70">
                  {pagination.total > 0
                    ? `${pagination.total} open opportunit${pagination.total === 1 ? "y is" : "ies are"} currently available across the school.`
                    : settings.careers_cta_text || "We welcome thoughtful educators and school professionals who want to make a lasting impact."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-warm-gray">
        <div className="section-container space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-[1.75rem] border border-border bg-card/95 p-6 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-secondary">{settings.careers_why_work_title || "Why work with us"}</p>
              <p className="text-sm leading-7 text-muted-foreground">{settings.careers_why_work_body || "Teach and lead in a values-driven school that cares deeply about student formation, collaboration, and professional excellence."}</p>
            </article>
            <article className="rounded-[1.75rem] border border-border bg-card/95 p-6 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-secondary">{settings.careers_culture_title || "Workplace culture"}</p>
              <p className="text-sm leading-7 text-muted-foreground">{settings.careers_culture_body || "Our teams work closely across academics, student care, and operations to create a calm, orderly, and uplifting school environment."}</p>
            </article>
            <article className="rounded-[1.75rem] border border-border bg-card/95 p-6 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-secondary">{settings.careers_benefits_title || "Benefits and support"}</p>
              <p className="text-sm leading-7 text-muted-foreground">{settings.careers_benefits_body || "We value people who grow with us and aim to provide supportive leadership, meaningful collaboration, and a professional place to thrive."}</p>
            </article>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Open vacancies</p>
                <p className="text-sm text-muted-foreground">Search current openings and filter the roles that best match your experience.</p>
              </div>
              <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
                <div className="relative min-w-[16rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applyFilters();
                      }
                    }}
                    className="pl-10"
                    placeholder="Search vacancies..."
                  />
                </div>
                <select
                  className="flex h-11 min-w-[12rem] rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm"
                  value={department}
                  onChange={(event) => updateFilter("department", event.target.value)}
                >
                  <option value="">All departments</option>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select
                  className="flex h-11 min-w-[12rem] rounded-xl border border-border bg-background px-3 text-sm text-foreground shadow-sm"
                  value={employmentType}
                  onChange={(event) => updateFilter("employment_type", event.target.value)}
                >
                  <option value="">All employment types</option>
                  {employmentTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <Button onClick={applyFilters}>Search</Button>
              </div>
            </div>

            {loading ? (
              <PublicEmptyState
                title="Loading career opportunities..."
                description="Fetching the latest openings and employer information."
                actionLabel=""
                actionHref=""
              />
            ) : items.length === 0 ? (
              <PublicEmptyState
                title={query || department || employmentType ? "No vacancies matched your filters" : "No open vacancies right now"}
                description={query || department || employmentType
                  ? "Try another search term or reset the filters to view all currently open opportunities."
                  : settings.careers_cta_text || "We may not be hiring right now, but we welcome future interest from qualified educators and school professionals."}
                actionLabel="Contact HR"
                actionHref="/#contact"
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((item) => (
                  <article key={item.id} className="rounded-[1.5rem] border border-border/80 bg-background/80 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {item.featured ? <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">Featured</span> : null}
                          <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{item.hiring_status}</span>
                          {item.employment_type ? <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{item.employment_type}</span> : null}
                        </div>
                        <h2 className="font-heading text-2xl font-bold text-foreground">{item.title}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {item.department ? <span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" />{item.department}</span> : null}
                          {item.location ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{item.location}</span> : null}
                        </div>
                      </div>
                      {item.application_deadline ? (
                        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Deadline</p>
                          <p className="text-sm font-semibold text-foreground">{item.application_deadline}</p>
                        </div>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      {item.short_summary || item.full_description || "View this vacancy to read the full job overview and requirements."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild>
                        <Link to={`/careers/${item.slug}`}>
                          View vacancy <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      {item.application_email ? (
                        <Button asChild variant="outline">
                          <a href={`mailto:${item.application_email}?subject=${encodeURIComponent(`Application for ${item.title}`)}`}>
                            Apply by email
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {pagination.page_count > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(Math.max(1, page - 1)));
                    setSearchParams(next);
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.page_count}</span>
                <Button
                  variant="outline"
                  disabled={page >= pagination.page_count}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set("page", String(Math.min(pagination.page_count, page + 1)));
                    setSearchParams(next);
                  }}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 rounded-[1.9rem] border border-border bg-card px-6 py-8 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)] lg:px-8">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-secondary">{settings.careers_hr_title || "HR contact"}</p>
              <h2 className="font-heading text-3xl font-bold text-foreground">{settings.careers_cta_text || "Interested in future opportunities?"}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{settings.careers_hr_body || "If you do not see the right vacancy today, you can still contact our HR team to express your interest in future openings."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-background/75 p-5">
              <div className="space-y-3 text-sm text-muted-foreground">
                {settings.careers_hr_email ? <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{settings.careers_hr_email}</p> : null}
                {settings.careers_hr_phone ? <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{settings.careers_hr_phone}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CareersPage;
