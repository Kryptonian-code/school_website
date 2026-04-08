import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { StaffMember } from "@/types/content";

const StaffPage = () => {
  const { data } = useSiteContent();
  const schoolName = data?.settings.school_name || "Prestige Academy";
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getPublicStaff().then((response) => setStaff(response.items)).catch(() => setStaff([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`Staff Directory | ${schoolName}`}
        description={`Meet the teaching, leadership, and support team serving families at ${schoolName}.`}
        canonicalPath="/staff"
        siteName={schoolName}
        keywords={["school staff", "teachers", schoolName]}
      />
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Staff Directory</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">Meet Our Team</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl">
            A dedicated group of educators, administrators, and support staff working together to help students thrive.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          {loading ? (
            <PublicEmptyState
              title="Loading staff directory..."
              description="Fetching the latest staff profiles for the public directory."
            />
          ) : staff.length === 0 ? (
            <PublicEmptyState
              title="Staff profiles will appear here soon"
              description="The school team directory is being updated. Please contact the school directly if you need to reach a teacher or office representative."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {staff.map((member, index) => (
                <ScrollReveal key={member.id} delay={index * 75}>
                  <article className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
                    <div className="flex items-start gap-4">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover border border-border shrink-0"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full gradient-navy text-primary-foreground flex items-center justify-center font-heading font-bold text-xl shrink-0">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="font-heading font-semibold text-xl text-foreground">{member.name}</h2>
                        <p className="text-secondary font-medium mt-1">{member.position || "Staff Member"}</p>
                        <p className="text-sm text-muted-foreground">{member.department || "School Team"}</p>
                        {member.qualification && (
                          <p className="text-sm text-muted-foreground mt-2">{member.qualification}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                      {member.bio || "Committed to supporting student growth, family partnership, and day-to-day excellence across the school."}
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
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default StaffPage;
