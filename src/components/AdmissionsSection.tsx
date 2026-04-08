import { ArrowRight, Calendar, CheckCircle, ClipboardList, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeLink from "@/components/SafeLink";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { defaultSiteSettings } from "@/lib/siteContent";

const AdmissionsSection = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};
  const steps = [
    { icon: ClipboardList, title: settings.admissions_step_1_title || defaultSiteSettings.admissions_step_1_title, desc: settings.admissions_step_1_desc || defaultSiteSettings.admissions_step_1_desc },
    { icon: FileText, title: settings.admissions_step_2_title || defaultSiteSettings.admissions_step_2_title, desc: settings.admissions_step_2_desc || defaultSiteSettings.admissions_step_2_desc },
    { icon: Calendar, title: settings.admissions_step_3_title || defaultSiteSettings.admissions_step_3_title, desc: settings.admissions_step_3_desc || defaultSiteSettings.admissions_step_3_desc },
    { icon: CheckCircle, title: settings.admissions_step_4_title || defaultSiteSettings.admissions_step_4_title, desc: settings.admissions_step_4_desc || defaultSiteSettings.admissions_step_4_desc },
  ];

  return (
    <section id="admissions" className="section-padding gradient-navy text-primary-foreground">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">{settings.admissions_badge || defaultSiteSettings.admissions_badge}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{settings.admissions_title || defaultSiteSettings.admissions_title}</h2>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              {settings.admissions_subtitle || defaultSiteSettings.admissions_subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 100}>
              <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/10 h-full">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="text-xs text-primary-foreground/40 font-semibold mb-1">Step {index + 1}</div>
                <h4 className="font-heading font-semibold text-primary-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-primary-foreground/60 leading-relaxed">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8">
              <SafeLink to={settings.cta_primary_url || defaultSiteSettings.cta_primary_url} fallbackTo="/admissions/apply">
                {settings.cta_primary_label || defaultSiteSettings.cta_primary_label} <ArrowRight className="ml-2 h-4 w-4" />
              </SafeLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8 backdrop-blur-sm">
              <SafeLink to={settings.cta_secondary_url || defaultSiteSettings.cta_secondary_url} fallbackTo="/#contact">
                {settings.cta_secondary_label || defaultSiteSettings.cta_secondary_label} <Calendar className="ml-2 h-4 w-4" />
              </SafeLink>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AdmissionsSection;
