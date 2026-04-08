export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  email?: string | null;
  role: string;
  is_active?: number;
  recovery_key_created_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SystemHealth {
  database: {
    connected: boolean;
    server_version: string;
  };
  uploads: {
    path: string;
    writable: boolean;
  };
  session: {
    cookie_secure: boolean;
    cookie_name: string;
  };
  security: {
    site_origin_configured: boolean;
    allowed_origins_count: number;
    recovery_keys_ready: number;
  };
  generated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  page_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ActivityLogEntry {
  id: number;
  admin_id: number | null;
  admin_username: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  summary: string | null;
  created_at: string;
}

export interface Programme {
  id: number;
  title: string;
  slug: string;
  age_group: string | null;
  duration: string | null;
  short_description: string | null;
  full_description: string | null;
  highlights: string[];
  subjects: string[];
  theme_color: string;
  sort_order: number;
  brochure_url?: string | null;
  image_url?: string | null;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  featured_image_url?: string | null;
  published_at: string | null;
  created_at: string;
}

export interface CareerVacancy {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  experience_level: string | null;
  application_deadline: string | null;
  short_summary: string | null;
  full_description: string | null;
  requirements: string[];
  application_email: string | null;
  external_application_url: string | null;
  status: string;
  hiring_status: string;
  featured: number;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  display_order: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  message: string;
  rating: number;
  photo_url: string | null;
  is_published: number;
  display_order: number;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string | null;
  image_url: string;
  description: string | null;
  is_published: number;
  display_order: number;
}

export interface StaffMember {
  id: number;
  name: string;
  slug: string;
  position: string | null;
  department: string | null;
  qualification: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  bio: string | null;
  featured: number;
  sort_order: number;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_published: number;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

export interface AdmissionApplication {
  id: number;
  application_number: string;
  student_first_name: string;
  student_last_name: string;
  date_of_birth: string;
  gender: string;
  class_applying: string;
  term_applying: string;
  previous_school: string | null;
  parent_name: string;
  parent_relationship: string;
  parent_phone: string;
  alternate_phone: string | null;
  email: string;
  address: string;
  city: string;
  medical_information: string | null;
  notes: string | null;
  admin_feedback: string | null;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  enquiries: number;
  admissions: number;
  programmes: number;
  blog_posts: number;
  staff: number;
  faqs: number;
}

export interface SiteBootstrapData {
  settings: Record<string, string>;
  programmes: Programme[];
  staff: StaffMember[];
  faqs: FaqItem[];
  posts: BlogPost[];
  facilities: Facility[];
  testimonials: Testimonial[];
  galleryItems: GalleryItem[];
}
