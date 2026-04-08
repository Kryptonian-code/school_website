import graduationImg from "@/assets/gallery-graduation.jpg";
import classroomImg from "@/assets/gallery-classroom.jpg";
import cultureImg from "@/assets/gallery-culture.jpg";
import excursionImg from "@/assets/gallery-excursion.jpg";
import { Link } from "react-router-dom";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";

const GallerySection = () => {
  const { data } = useSiteContent();
  const images = (data?.galleryItems ?? []).slice(0, 4);
  const fallbackImages = [graduationImg, classroomImg, cultureImg, excursionImg];

  return (
    <section id="gallery" className="section-padding bg-background">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Gallery</p>
            <h2 className="section-title">Life at Prestige Academy</h2>
            <p className="section-subtitle mx-auto">A glimpse into the vibrant daily life, events, and celebrations at our school.</p>
          </div>
        </ScrollReveal>

        {images.length === 0 ? (
          <PublicEmptyState
            title="Gallery highlights are on the way"
            description="The school gallery is empty right now, but photo highlights will appear here once they are published."
            actionLabel="Open admissions page"
            actionHref="/admissions/apply"
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <ScrollReveal key={img.id} delay={i * 100}>
                <div className="group relative rounded-xl overflow-hidden cursor-pointer card-hover">
                  <img src={img.image_url || fallbackImages[i % fallbackImages.length]} alt={img.title} className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/60 transition-colors duration-300 flex items-center justify-center">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-primary-foreground font-heading font-semibold text-sm">{img.title}</p>
                      <p className="text-primary-foreground/70 text-xs">{img.category}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal>
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/gallery">View Full Gallery</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default GallerySection;
