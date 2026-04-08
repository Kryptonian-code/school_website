import { BookOpen, Heart, Star, Target } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import headteacherImg from "@/assets/headteacher.jpg";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { defaultSiteSettings } from "@/lib/siteContent";

const values = [
  { icon: BookOpen, title: "Academic Excellence", desc: "Rigorous curriculum aligned with Ghana Education Service expectations and enriched learning support." },
  { icon: Target, title: "Holistic Development", desc: "Balanced attention to academics, sports, arts, confidence, and personal leadership." },
  { icon: Heart, title: "Community & Care", desc: "A nurturing environment where every child is known, valued, and supported." },
  { icon: Star, title: "Global Readiness", desc: "Preparing students to thrive in an interconnected and competitive world." },
];

const AboutSection = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};

  return (
    <section id="about" className="section-padding bg-background">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">{settings.about_badge || defaultSiteSettings.about_badge}</p>
            <h2 className="section-title">{settings.about_title || defaultSiteSettings.about_title}</h2>
            <p className="section-subtitle mx-auto">
              {settings.about_subtitle || defaultSiteSettings.about_subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <ScrollReveal>
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-xl text-primary mb-2">{settings.mission_title || defaultSiteSettings.mission_title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {settings.mission_body || defaultSiteSettings.mission_body}
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl text-primary mb-2">{settings.vision_title || defaultSiteSettings.vision_title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {settings.vision_body || defaultSiteSettings.vision_body}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img
                  src={settings.headteacher_image_url || headteacherImg}
                  alt={`${settings.headteacher_name || defaultSiteSettings.headteacher_name}, Headteacher`}
                  className="w-full sm:w-48 h-56 sm:h-auto object-cover"
                  loading="lazy"
                  width={512}
                  height={640}
                />
                <div className="p-6 flex flex-col justify-center">
                  <p className="text-sm text-secondary font-semibold uppercase tracking-wide mb-1">{settings.headteacher_label || defaultSiteSettings.headteacher_label}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">
                    &quot;{settings.headteacher_message || defaultSiteSettings.headteacher_message}&quot;
                  </p>
                  <p className="font-heading font-semibold text-foreground">{settings.headteacher_name || defaultSiteSettings.headteacher_name}</p>
                  <p className="text-xs text-muted-foreground">{settings.headteacher_title || defaultSiteSettings.headteacher_title}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <ScrollReveal key={value.title} delay={index * 100}>
              <div className="bg-card rounded-xl p-6 border border-border card-hover text-center h-full">
                <div className="w-12 h-12 rounded-lg bg-gold-light flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-heading font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
