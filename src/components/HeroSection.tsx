import { ArrowRight, Award, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeLink from "@/components/SafeLink";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { defaultSiteSettings } from "@/lib/siteContent";
import heroImage from "@/assets/hero-school.jpg";

const HeroSection = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};
  const schoolName = settings.school_name || defaultSiteSettings.school_name;
  const programmes = data?.programmes ?? [];
  const staff = data?.staff ?? [];
  const posts = data?.posts ?? [];

  return (
    <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={settings.hero_image_url || heroImage}
          alt={`${schoolName} campus`}
          className="w-full h-full object-cover"
          fetchPriority="high"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      <div className="section-container relative z-10 py-20 md:py-28 xl:py-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-primary-foreground/90 mb-6 border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            {settings.hero_badge || defaultSiteSettings.hero_badge}
          </div>

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-heading font-extrabold text-primary-foreground leading-[0.95] mb-6 text-balance max-w-5xl">
            {settings.hero_title || defaultSiteSettings.hero_title}
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed">
            {settings.hero_subtitle || defaultSiteSettings.hero_subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8 shadow-lg">
              <SafeLink to={settings.hero_primary_cta_url || defaultSiteSettings.hero_primary_cta_url} fallbackTo="/admissions/apply">
                {settings.hero_primary_cta_label || defaultSiteSettings.hero_primary_cta_label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </SafeLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8 backdrop-blur-sm">
              <SafeLink to={settings.hero_secondary_cta_url || defaultSiteSettings.hero_secondary_cta_url} fallbackTo="/#contact">
                {settings.hero_secondary_cta_label || defaultSiteSettings.hero_secondary_cta_label}
              </SafeLink>
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              { icon: GraduationCap, value: `${programmes.length}`, label: "Programmes Available" },
              { icon: Users, value: `${staff.length}`, label: "Featured Staff" },
              { icon: Award, value: `${posts.length}`, label: "Recent News Stories" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="font-heading font-bold text-2xl text-primary-foreground">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
