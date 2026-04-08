import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeLink from "@/components/SafeLink";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { defaultSiteSettings } from "@/lib/siteContent";

const CTABanner = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};

  return (
    <section className="bg-secondary">
      <div className="section-container py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-secondary-foreground mb-2">
            {settings.cta_title || defaultSiteSettings.cta_title}
          </h2>
          <p className="text-secondary-foreground/70">
            {settings.cta_body || defaultSiteSettings.cta_body}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            <SafeLink to={settings.cta_primary_url || defaultSiteSettings.cta_primary_url} fallbackTo="/admissions/apply">
              {settings.cta_primary_label || defaultSiteSettings.cta_primary_label} <ArrowRight className="ml-2 h-4 w-4" />
            </SafeLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-secondary-foreground/40 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
            <SafeLink to={settings.cta_secondary_url || defaultSiteSettings.cta_secondary_url} fallbackTo="/#contact">
              <Phone className="mr-2 h-4 w-4" /> {settings.cta_secondary_label || defaultSiteSettings.cta_secondary_label}
            </SafeLink>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
