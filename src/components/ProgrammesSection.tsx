import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const ProgrammesSection = () => {
  const { data } = useSiteContent();
  const programmes = data?.programmes ?? [];

  return (
    <section id="programmes" className="section-padding bg-warm-gray">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Our Programmes</p>
            <h2 className="section-title">Academic Pathways for Every Stage</h2>
            <p className="section-subtitle mx-auto">
              From early years to high school, we offer a seamless learning journey designed to bring out the best in every learner.
            </p>
          </div>
        </ScrollReveal>

        {programmes.length === 0 ? (
          <PublicEmptyState
            title="Academic programmes will be published here soon"
            description="The admissions team is updating the programme catalogue. Please reach out if you need guidance on the right year group for your child."
            actionLabel="Contact admissions"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map((programme, index) => (
              <ScrollReveal key={programme.slug} delay={index * 100}>
                <div className={`rounded-xl p-6 border card-hover ${programme.theme_color} h-full`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-muted-foreground bg-background/60 rounded-full px-3 py-1">
                      {programme.age_group || "All ages"}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{programme.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {programme.short_description || programme.full_description || "Explore this programme."}
                  </p>
                  <Link
                    to={`/programmes/${programme.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Learn More <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link to="/programmes">Explore All Programmes</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ProgrammesSection;
