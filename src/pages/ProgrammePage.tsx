import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageMeta from "@/components/PageMeta";
import ScrollReveal from "@/components/ScrollReveal";
import StructuredData from "@/components/StructuredData";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { Programme } from "@/types/content";

const ProgrammePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useSiteContent();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getPublicProgramme(slug).then((response) => setProgramme(response.item)).catch(() => setProgramme(null)).finally(() => setLoading(false));
    api.getPublicProgrammes({ page: 1, limit: 50 }).then((response) => setProgrammes(response.items)).catch(() => setProgrammes([]));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading programme...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Programme Not Found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIndex = programmes.findIndex((item) => item.slug === slug);
  const nextProgramme = programmes[(currentIndex + 1) % programmes.length];
  const schoolName = data?.settings.school_name || "Prestige Academy";
  const description = programme.short_description || programme.full_description || `Learn more about the ${programme.title} programme.`;
  const programmeData = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: programme.title,
    description,
    provider: {
      "@type": "EducationalOrganization",
      name: schoolName,
    },
    timeToComplete: programme.duration || undefined,
    occupationalCategory: programme.age_group || undefined,
    url: new URL(`/programmes/${programme.slug}`, window.location.origin).toString(),
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${programme.title} | ${schoolName}`}
        description={description}
        canonicalPath={`/programmes/${programme.slug}`}
        image={programme.image_url || undefined}
        siteName={schoolName}
        keywords={[programme.title, "school programme", schoolName]}
      />
      <StructuredData id={`programme-${programme.slug}`} data={programmeData} />
      <Header />

      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container">
          <Link
            to="/#programmes"
            className="inline-flex items-center text-sm text-primary-foreground/60 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All Programmes
          </Link>
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">{programme.title}</h1>
            <p className="text-xl text-primary-foreground/70 max-w-2xl mb-8">
              {programme.short_description || programme.full_description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 text-sm">
                <Users className="h-4 w-4 text-secondary" />
                Ages: {programme.age_group || "All ages"}
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 text-sm">
                <Clock className="h-4 w-4 text-secondary" />
                Duration: {programme.duration || "Flexible"}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            <ScrollReveal className="lg:col-span-2">
              <h2 className="section-title mb-6">Programme Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-lg mb-8">
                {programme.full_description || programme.short_description}
              </p>

              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">Programme Highlights</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {programme.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border">
                    <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className={`rounded-xl p-6 border-2 ${programme.theme_color}`}>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-semibold text-lg text-foreground">Subjects Offered</h3>
                </div>
                <ul className="space-y-2">
                  {programme.subjects.map((subject) => (
                    <li key={subject} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {subject}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    <Link to="/admissions/apply">Apply for {programme.title}</Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {nextProgramme && (
        <section className="section-padding bg-warm-gray">
          <div className="section-container text-center">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Explore More</p>
            <h2 className="section-title mb-6">Next Programme</h2>
            <Link to={`/programmes/${nextProgramme.slug}`}>
              <div className={`inline-block rounded-xl p-8 border-2 ${nextProgramme.theme_color} card-hover max-w-md mx-auto`}>
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">{nextProgramme.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{nextProgramme.short_description}</p>
                <span className="inline-flex items-center text-sm font-medium text-primary">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <CTABanner />
      <Footer />
    </div>
  );
};

export default ProgrammePage;
