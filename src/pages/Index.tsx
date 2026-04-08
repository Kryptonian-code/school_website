import AboutSection from "@/components/AboutSection";
import AdmissionsSection from "@/components/AdmissionsSection";
import ContactSection from "@/components/ContactSection";
import CTABanner from "@/components/CTABanner";
import FacilitiesSection from "@/components/FacilitiesSection";
import Footer from "@/components/Footer";
import GallerySection from "@/components/GallerySection";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewsSection from "@/components/NewsSection";
import PageMeta from "@/components/PageMeta";
import ProgrammesSection from "@/components/ProgrammesSection";
import StructuredData from "@/components/StructuredData";
import StaffDirectorySection from "@/components/StaffDirectorySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import { useSiteContent } from "@/contexts/SiteContentContext";
import heroImage from "@/assets/hero-school.jpg";

const Index = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};
  const schoolName = settings.school_name || "Prestige Academy";
  const tagline = settings.tagline || "Excellence in Education";
  const description = `${schoolName} is a Ghanaian school community offering strong academics, character formation, and a supportive learning environment for families.`;
  const logoImage = settings.hero_image_url || heroImage;
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: schoolName,
    description,
    url: window.location.origin,
    logo: new URL(logoImage, window.location.origin).toString(),
    email: settings.email || undefined,
    telephone: settings.phone || undefined,
    address: settings.address ? {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "GH",
    } : undefined,
  };
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: schoolName,
    url: window.location.origin,
    description,
  };

  return (
    <div className="min-h-screen">
      <PageMeta
        title={`${schoolName} | ${tagline}`}
        description={description}
        image={logoImage}
        siteName={schoolName}
        canonicalPath="/"
        keywords={["Ghana school", "Accra school", schoolName, "admissions", "school programmes"]}
      />
      <StructuredData id="home-organization" data={[organizationData, websiteData]} />
      <Header />
      <HeroSection />
      <AboutSection />
      <ProgrammesSection />
      <AdmissionsSection />
      <StaffDirectorySection />
      <FacilitiesSection />
      <TestimonialsSection />
      <GallerySection />
      <FaqSection />
      <NewsSection />
      <CTABanner />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
