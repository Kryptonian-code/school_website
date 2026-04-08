import scienceLabImg from "@/assets/facility-science-lab.jpg";
import libraryImg from "@/assets/facility-library.jpg";
import ictImg from "@/assets/facility-ict.jpg";
import sportsImg from "@/assets/facility-sports.jpg";
import PublicEmptyState from "@/components/PublicEmptyState";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const FacilitiesSection = () => {
  const { data } = useSiteContent();
  const facilities = data?.facilities ?? [];
  const facilityImages = [scienceLabImg, libraryImg, ictImg, sportsImg];

  return (
    <section id="facilities" className="section-padding bg-background">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Our Facilities</p>
            <h2 className="section-title">World-Class Learning Environment</h2>
            <p className="section-subtitle mx-auto">
              Our campus is designed to inspire learning with modern facilities that support academic, creative, and athletic pursuits.
            </p>
          </div>
        </ScrollReveal>

        {facilities.length === 0 ? (
          <PublicEmptyState
            title="Campus facility highlights are being updated"
            description="This section will showcase the learning spaces available on campus as soon as the content team publishes them."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {facilities.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="group relative rounded-2xl overflow-hidden card-hover shadow-md">
                  <img src={f.image_url || facilityImages[i % facilityImages.length]} alt={f.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading font-semibold text-xl text-primary-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-primary-foreground/80">{f.short_description}</p>
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

export default FacilitiesSection;
