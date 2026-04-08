import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Mail, MapPin } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import SafeLink from "@/components/SafeLink";
import StructuredData from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/siteContent";
import type { CareerVacancy } from "@/types/content";

const CareerPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useSiteContent();
  const settings = data?.settings ?? defaultSiteSettings;
  const schoolName = settings.school_name || defaultSiteSettings.school_name;
  const [vacancy, setVacancy] = useState<CareerVacancy | null>(null);
  const [related, setRelated] = useState<CareerVacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getPublicCareer(slug)
      .then((response) => {
        setVacancy(response.item);
        return api.getPublicCareers({ page: 1, limit: 4, hiring_status: "open" });
      })
      .then((response) => setRelated(response.items))
      .catch(() => {
        setVacancy(null);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const otherOpenRoles = useMemo(
    () => related.filter((item) => item.slug !== slug).slice(0, 3),
    [related, slug],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-24 text-center">
          <p className="text-muted-foreground">Loading vacancy...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-24">
          <PublicEmptyState
            title="Vacancy not found"
            description="This role may have been removed, unpublished, or the link may be incorrect."
            actionLabel="View careers page"
            actionHref="/careers"
          />
        </div>
        <Footer />
      </div>
    );
  }

  const applyHref = vacancy.external_application_url || (vacancy.application_email
    ? `mailto:${vacancy.application_email}?subject=${encodeURIComponent(`Application for ${vacancy.title}`)}`
    : null);
  const description = vacancy.short_summary || vacancy.full_description || `Explore the ${vacancy.title} opportunity at ${schoolName}.`;
  const jobPostingData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description,
    hiringOrganization: {
      "@type": "EducationalOrganization",
      name: schoolName,
    },
    employmentType: vacancy.employment_type || undefined,
    datePosted: vacancy.created_at,
    validThrough: vacancy.application_deadline || undefined,
    jobLocation: vacancy.location ? {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.location,
        addressCountry: "GH",
      },
    } : undefined,
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Ghana",
    },
    directApply: Boolean(vacancy.external_application_url),
    url: new URL(`/careers/${vacancy.slug}`, window.location.origin).toString(),
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`${vacancy.title} | Careers | ${schoolName}`}
        description={description}
        canonicalPath={`/careers/${vacancy.slug}`}
        siteName={schoolName}
        keywords={[vacancy.title, "school careers", schoolName]}
      />
      <StructuredData id={`career-${vacancy.slug}`} data={jobPostingData} />
      <Header />

      <section className="gradient-navy py-16 text-primary-foreground md:py-24">
        <div className="section-container max-w-5xl">
          <Link to="/careers" className="mb-6 inline-flex items-center text-sm text-primary-foreground/70 hover:text-primary-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to careers
          </Link>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary">{vacancy.hiring_status}</span>
              <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground/75">{vacancy.status}</span>
              {vacancy.employment_type ? <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground/75">{vacancy.employment_type}</span> : null}
            </div>
            <h1 className="font-heading text-4xl font-extrabold md:text-5xl">{vacancy.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-primary-foreground/75">
              {vacancy.short_summary || vacancy.full_description || "Read the full role overview, requirements, and application guidance below."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/70">
              {vacancy.department ? <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" />{vacancy.department}</span> : null}
              {vacancy.location ? <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{vacancy.location}</span> : null}
              {vacancy.application_deadline ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Deadline: {vacancy.application_deadline}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <div className="space-y-8">
            <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-2xl font-bold text-foreground">Role overview</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {vacancy.full_description || vacancy.short_summary || "Full job details will be shared by the school team."}
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-2xl font-bold text-foreground">Requirements</h2>
              {vacancy.requirements.length > 0 ? (
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {vacancy.requirements.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-7 text-muted-foreground">The school will share role requirements directly with interested candidates.</p>
              )}
            </article>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-foreground">Apply for this role</h2>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                {vacancy.application_deadline ? (
                  <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Applications close on {vacancy.application_deadline}</p>
                ) : null}
                {vacancy.application_email ? (
                  <p className="inline-flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-primary" />{vacancy.application_email}</p>
                ) : null}
                {applyHref ? (
                  <Button asChild className="w-full">
                    <SafeLink to={applyHref} fallbackTo={`mailto:${settings.careers_hr_email || settings.email || defaultSiteSettings.email}`} target={vacancy.external_application_url ? "_blank" : undefined}>
                      Apply now <ArrowRight className="ml-2 h-4 w-4" />
                    </SafeLink>
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <SafeLink to={`mailto:${settings.careers_hr_email || settings.email || defaultSiteSettings.email}?subject=${encodeURIComponent(`Interest in ${vacancy.title}`)}`}>
                      Contact HR <ArrowRight className="ml-2 h-4 w-4" />
                    </SafeLink>
                  </Button>
                )}
              </div>
            </div>

            {otherOpenRoles.length > 0 ? (
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-foreground">Other open vacancies</h2>
                <div className="mt-4 space-y-4">
                  {otherOpenRoles.map((item) => (
                    <Link key={item.id} to={`/careers/${item.slug}`} className="block rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-primary/20 hover:bg-background">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.department || "School vacancy"}{item.location ? ` • ${item.location}` : ""}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CareerPage;
