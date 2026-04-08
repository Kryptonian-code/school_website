import type { SiteBootstrapData } from "@/types/content";
import { resolveAssetPath } from "@/lib/runtimePaths";

export const defaultSiteSettings: Record<string, string> = {
  admin_brand_name: "Prestige Admin",
  admin_brand_subtitle: "School website content desk",
  admin_sidebar_badge: "Content Manager",
  admin_header_label: "Prestige Academy CMS",
  school_name: "Prestige Academy",
  tagline: "Excellence in Education",
  phone: "+233 30 255 1234",
  alternate_phone: "+233 24 555 6789",
  email: "info@prestigeacademy.edu.gh",
  address: "15 Academy Drive, East Legon, Accra, Ghana",
  office_hours: "Monday - Friday: 7:30 AM - 4:30 PM",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  youtube_url: "",
  whatsapp_number: "+233245556789",
  hero_badge: "Trusted by families across Accra",
  hero_title: "Raising confident learners and future-ready leaders.",
  hero_subtitle:
    "A warm, high-performing Ghanaian school community where strong academics, character, and creativity grow side by side.",
  hero_primary_cta_label: "Apply Now",
  hero_primary_cta_url: "/admissions/apply",
  hero_secondary_cta_label: "Book a Visit",
  hero_secondary_cta_url: "/#contact",
  hero_image_url: "",
  about_badge: "About Us",
  about_title: "A Legacy of Excellence Since 1998",
  about_subtitle:
    "Prestige Academy has been shaping the minds of Ghana's future leaders for over 25 years with a values-driven and student-centered education.",
  mission_title: "Our Mission",
  mission_body:
    "To provide a transformative educational experience that develops intellectually curious, morally grounded, and socially responsible individuals.",
  vision_title: "Our Vision",
  vision_body:
    "To be a leading center of academic excellence in West Africa, known for producing well-rounded graduates who create positive change.",
  headteacher_label: "Headteacher's Message",
  headteacher_name: "Mrs. Abena Mensah",
  headteacher_title: "M.Ed, B.Ed - Headteacher",
  headteacher_message:
    "Every child who walks through our gates carries the potential to make a meaningful difference. Our responsibility is to nurture that potential with care and excellence.",
  headteacher_image_url: "",
  admissions_badge: "Admissions",
  admissions_title: "Begin Your Child's Journey",
  admissions_subtitle:
    "Our admissions process is designed to be simple, transparent, and family-friendly from the first enquiry to enrollment.",
  admissions_step_1_title: "Submit Application",
  admissions_step_1_desc:
    "Complete the online application form with student and parent details.",
  admissions_step_2_title: "Review Details",
  admissions_step_2_desc:
    "Our admissions team reviews your application and follows up if anything else is needed.",
  admissions_step_3_title: "Assessment & Interview",
  admissions_step_3_desc:
    "Eligible applicants are invited for placement support and a brief family interaction.",
  admissions_step_4_title: "Receive Decision",
  admissions_step_4_desc:
    "Successful applicants receive their next-step guidance and enrollment information.",
  cta_title: "Ready to Join the Prestige Academy Family?",
  cta_body:
    "Applications are open and our admissions team is ready to guide you through the next steps.",
  cta_primary_label: "Apply Now",
  cta_primary_url: "/admissions/apply",
  cta_secondary_label: "Call Admissions",
  cta_secondary_url: "/#contact",
  contact_badge: "Contact Us",
  contact_title: "Get in Touch",
  contact_subtitle:
    "Have questions about admissions, programmes, or our school? We would love to hear from you.",
  contact_map_embed_url: "",
  careers_page_title: "Careers at Prestige Academy",
  careers_intro_text:
    "Join a school community that values excellent teaching, strong character, warm collaboration, and long-term student impact.",
  careers_why_work_title: "Why Work With Us",
  careers_why_work_body:
    "We are building a professional school culture where teachers and support staff are respected, developed, and empowered to do meaningful work every day.",
  careers_culture_title: "Workplace Culture",
  careers_culture_body:
    "Our teams thrive in a structured, caring environment that values planning, accountability, teamwork, and a genuine commitment to children and families.",
  careers_benefits_title: "Benefits and Compensation",
  careers_benefits_body:
    "We aim to offer a fair, supportive employment experience with professional growth opportunities, clear communication, and a healthy working rhythm.",
  careers_hr_title: "HR Contact",
  careers_hr_body:
    "For recruitment questions or partnership enquiries, our HR team is available to guide applicants on the next steps.",
  careers_hr_email: "hr@prestigeacademy.edu.gh",
  careers_hr_phone: "+233 30 255 1234",
  careers_cta_text: "Explore current opportunities and help shape the future of learning at Prestige Academy.",
};

export const defaultSiteBootstrapData: SiteBootstrapData = {
  settings: defaultSiteSettings,
  programmes: [],
  staff: [],
  faqs: [],
  posts: [],
  facilities: [],
  testimonials: [],
  galleryItems: [],
};

export function normalizeSiteBootstrapData(value: unknown): SiteBootstrapData {
  const input = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const settings =
    typeof input.settings === "object" && input.settings !== null ? (input.settings as Record<string, string>) : {};

  return {
    settings: normalizeSettings({ ...defaultSiteSettings, ...settings }),
    programmes: Array.isArray(input.programmes) ? input.programmes.map(normalizeProgramme) : [],
    staff: Array.isArray(input.staff) ? input.staff.map(normalizeStaffMember) : [],
    faqs: Array.isArray(input.faqs) ? input.faqs : [],
    posts: Array.isArray(input.posts) ? input.posts.map(normalizeBlogPost) : [],
    facilities: Array.isArray(input.facilities) ? input.facilities.map(normalizeFacility) : [],
    testimonials: Array.isArray(input.testimonials) ? input.testimonials.map(normalizeTestimonial) : [],
    galleryItems: Array.isArray(input.galleryItems) ? input.galleryItems.map(normalizeGalleryItem) : [],
  };
}

function normalizeSettings(settings: Record<string, string>): Record<string, string> {
  return {
    ...settings,
    hero_image_url: resolveAssetPath(settings.hero_image_url || ""),
    headteacher_image_url: resolveAssetPath(settings.headteacher_image_url || ""),
  };
}

function normalizeProgramme(programme: Record<string, unknown>) {
  return {
    ...programme,
    brochure_url: resolveAssetPath((programme.brochure_url as string | null | undefined) || ""),
    image_url: resolveAssetPath((programme.image_url as string | null | undefined) || ""),
  };
}

function normalizeBlogPost(post: Record<string, unknown>) {
  return {
    ...post,
    featured_image_url: resolveAssetPath((post.featured_image_url as string | null | undefined) || ""),
  };
}

function normalizeStaffMember(member: Record<string, unknown>) {
  return {
    ...member,
    photo_url: resolveAssetPath((member.photo_url as string | null | undefined) || ""),
  };
}

function normalizeFacility(facility: Record<string, unknown>) {
  return {
    ...facility,
    image_url: resolveAssetPath((facility.image_url as string | null | undefined) || ""),
  };
}

function normalizeTestimonial(testimonial: Record<string, unknown>) {
  return {
    ...testimonial,
    photo_url: resolveAssetPath((testimonial.photo_url as string | null | undefined) || ""),
  };
}

function normalizeGalleryItem(item: Record<string, unknown>) {
  return {
    ...item,
    image_url: resolveAssetPath((item.image_url as string | undefined) || ""),
  };
}
