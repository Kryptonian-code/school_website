import { useEffect, useState } from "react";
import graduationImg from "@/assets/gallery-graduation.jpg";
import classroomImg from "@/assets/gallery-classroom.jpg";
import cultureImg from "@/assets/gallery-culture.jpg";
import excursionImg from "@/assets/gallery-excursion.jpg";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import PublicEmptyState from "@/components/PublicEmptyState";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { api } from "@/lib/api";
import type { GalleryItem } from "@/types/content";

const PAGE_SIZE = 8;

const GalleryPage = () => {
  const { data } = useSiteContent();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const fallbackImages = [graduationImg, classroomImg, cultureImg, excursionImg];
  const schoolName = data?.settings.school_name || "Prestige Academy";

  useEffect(() => {
    setLoading(true);
    api.getPublicGalleryItems()
      .then((response) => setItems(response.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={`Gallery | ${schoolName}`}
        description={`See campus life, events, and student highlights from ${schoolName} in the school gallery.`}
      />
      <Header />
      <section className="gradient-navy text-primary-foreground py-16 md:py-24">
        <div className="section-container max-w-4xl">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Gallery</p>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4">School Life in Pictures</h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl">
            Explore moments from our classrooms, events, celebrations, and student life across the school community.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          {loading ? (
            <PublicEmptyState
              title="Loading gallery..."
              description="Fetching the latest campus images and event highlights."
              actionLabel="Return home"
              actionHref="/"
            />
          ) : items.length === 0 ? (
            <PublicEmptyState
              title="No gallery images have been published yet"
              description="Campus photos and event highlights will appear here once the gallery is updated."
              actionLabel="Return home"
              actionHref="/"
            />
          ) : (
            <>
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pagedItems.map((item, index) => (
              <figure key={item.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
                <img
                  src={item.image_url || fallbackImages[index % fallbackImages.length]}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImages[index % fallbackImages.length];
                  }}
                />
                <figcaption className="p-4">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.category || "Gallery"}</p>
                  {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
            </>
          )}

          {items.length > PAGE_SIZE && pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
              <Button variant="outline" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GalleryPage;
