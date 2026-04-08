import { Star, Quote } from "lucide-react";
import PublicEmptyState from "@/components/PublicEmptyState";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const TestimonialsSection = () => {
  const { data } = useSiteContent();
  const testimonials = data?.testimonials ?? [];

  return (
    <section className="section-padding bg-warm-gray">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="section-title">What Our Community Says</h2>
            <p className="section-subtitle mx-auto">Hear from parents, students, and alumni about their experience at Prestige Academy.</p>
          </div>
        </ScrollReveal>

        {testimonials.length === 0 ? (
          <PublicEmptyState
            title="Community testimonials will be added here soon"
            description="Parent and student feedback will appear here once the school has published approved testimonials."
          />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <div className="bg-card rounded-xl p-6 border border-border card-hover relative h-full">
                  <Quote className="h-8 w-8 text-secondary/30 absolute top-5 right-5" />
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">"{t.message}"</p>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
