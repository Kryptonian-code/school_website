import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const StaffDirectorySection = () => {
  const { data } = useSiteContent();
  const staff = data?.staff ?? [];

  return (
    <section id="staff" className="section-padding bg-warm-gray">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Staff Directory</p>
            <h2 className="section-title">Meet the Team Behind the School</h2>
            <p className="section-subtitle mx-auto">
              The people guiding learning, admissions, student support, and school operations every day.
            </p>
          </div>
        </ScrollReveal>

        {staff.length === 0 ? (
          <PublicEmptyState
            title="Featured staff will appear here soon"
            description="Leadership and staff profiles are being refreshed. Families can still contact the school directly for guidance."
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {staff.map((member, index) => (
              <ScrollReveal key={member.id} delay={index * 100}>
                <article className="bg-card rounded-2xl border border-border p-6 h-full shadow-sm">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-16 h-16 rounded-full object-cover border border-border mb-4" loading="lazy" />
                  ) : (
                    <div className="w-16 h-16 rounded-full gradient-navy text-primary-foreground flex items-center justify-center font-heading font-bold text-xl mb-4">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-heading font-semibold text-lg text-foreground">{member.name}</h3>
                  <p className="text-sm text-secondary font-medium mt-1">{member.position || "Staff Member"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.department || "School Team"}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    {member.bio || "Dedicated to supporting students and families with care and professionalism."}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {member.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal>
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/staff">View Full Directory</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default StaffDirectorySection;
