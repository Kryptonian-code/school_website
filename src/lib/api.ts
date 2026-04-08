import type {
  ActivityLogEntry,
  AdminUser,
  AdmissionApplication,
  BlogPost,
  CareerVacancy,
  DashboardStats,
  Enquiry,
  Facility,
  FaqItem,
  GalleryItem,
  PaginatedResponse,
  Programme,
  SiteBootstrapData,
  StaffMember,
  SystemHealth,
  Testimonial,
} from "@/types/content";
import { normalizeSiteBootstrapData } from "@/lib/siteContent";
import { resolveApiBasePath, resolveAssetPath } from "@/lib/runtimePaths";

const API_BASE_URL = resolveApiBasePath(import.meta.env.VITE_API_BASE_URL as string | undefined);
let csrfToken: string | null = null;

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export interface CollectionQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface CareersQuery extends CollectionQuery {
  status?: string;
  hiring_status?: string;
  department?: string;
  employment_type?: string;
}

export interface PublicCareersResponse {
  items: CareerVacancy[];
  pagination: PaginatedResponse<CareerVacancy>["pagination"];
  filters: {
    departments: string[];
    employment_types: string[];
  };
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers ?? {});

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (method !== "GET" && csrfToken && !headers.has("X-CSRF-Token")) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error("The local API could not be reached. Make sure Apache is running and, if you are using Vite on localhost:8080, restart it after setting the API proxy.");
  }

  const contentType = response.headers?.get?.("content-type") ?? "";
  const shouldTryJson = contentType.includes("application/json") || typeof response.json === "function";
  const payload = shouldTryJson
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your admin session has expired. Please sign in again and retry the action.");
    }
    if (response.status === 404 && !contentType.includes("application/json")) {
      throw new Error("The API route was not found. If you are running the Vite dev server, restart it so /backend can proxy to your Apache/PHP backend.");
    }
    throw new Error(payload.message || "Something went wrong.");
  }

  if (payload && typeof payload === "object" && "csrf_token" in payload && typeof payload.csrf_token === "string") {
    csrfToken = payload.csrf_token;
  }

  return payload as T;
}

export const api = {
  getSiteBootstrap: async (scope: "full" | "settings" = "full") =>
    normalizeSiteBootstrapData(await apiRequest<SiteBootstrapData>(`/site/bootstrap${buildQuery({ scope })}`)),
  getSession: () => apiRequest<{ user: AdminUser | null; csrf_token?: string }>("/auth/session"),
  getSetupStatus: () => apiRequest<{ has_admin: boolean }>("/auth/setup-status"),
  login: (username: string, password: string) =>
    apiRequest<{ user: AdminUser; csrf_token?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  bootstrapAdmin: (payload: { username: string; display_name: string; email?: string; password: string }) =>
    apiRequest<{ success: boolean }>("/auth/bootstrap-admin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  recoverPassword: (payload: { username: string; recovery_key: string; password: string }) =>
    apiRequest<{ success: boolean; message: string }>("/auth/recover-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    apiRequest<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  uploadMedia: async (file: File, folder = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const result = await apiRequest<{ success: boolean; url: string; filename: string }>("/uploads", {
      method: "POST",
      body: formData,
    });
    return {
      ...result,
      url: resolveAssetPath(result.url),
    };
  },
  submitEnquiry: (payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean }>("/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitAdmission: (payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean; application_number: string }>("/admissions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getDashboardStats: () => apiRequest<DashboardStats>("/dashboard/stats"),
  getSystemHealth: () => apiRequest<SystemHealth>("/dashboard/health"),
  getProgrammes: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<Programme>>(`/programmes${buildQuery(params)}`),
  saveProgramme: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/programmes/${id}` : "/programmes", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteProgramme: (id: number) =>
    apiRequest<{ success: boolean }>(`/programmes/${id}`, { method: "DELETE" }),
  getBlogPosts: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<BlogPost>>(`/blog-posts${buildQuery(params)}`),
  getPublicBlogPosts: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<BlogPost>>(`/public/blog-posts${buildQuery(params)}`),
  getPublicBlogPost: (slug: string) => apiRequest<{ item: BlogPost | null }>(`/public/blog-posts/${slug}`),
  getPublicProgrammes: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<Programme>>(`/public/programmes${buildQuery(params)}`),
  getPublicProgramme: (slug: string) => apiRequest<{ item: Programme | null }>(`/public/programmes/${slug}`),
  getPublicGalleryItems: () => apiRequest<{ items: GalleryItem[] }>("/public/gallery-items"),
  getPublicStaff: async () => {
    const response = await apiRequest<{ items: StaffMember[] }>("/public/staff");
    return {
      items: response.items.map((item) => ({
        ...item,
        photo_url: resolveAssetPath(item.photo_url || ""),
      })),
    };
  },
  getCareers: (params: CareersQuery = {}) => apiRequest<PaginatedResponse<CareerVacancy>>(`/careers${buildQuery(params)}`),
  getPublicCareers: (params: CareersQuery = {}) => apiRequest<PublicCareersResponse>(`/public/careers${buildQuery(params)}`),
  getPublicCareer: (slug: string) => apiRequest<{ item: CareerVacancy | null }>(`/public/careers/${slug}`),
  saveCareer: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/careers/${id}` : "/careers", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteCareer: (id: number) =>
    apiRequest<{ success: boolean }>(`/careers/${id}`, { method: "DELETE" }),
  saveBlogPost: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/blog-posts/${id}` : "/blog-posts", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteBlogPost: (id: number) =>
    apiRequest<{ success: boolean }>(`/blog-posts/${id}`, { method: "DELETE" }),
  getStaff: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<StaffMember>>(`/staff${buildQuery(params)}`),
  saveStaff: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/staff/${id}` : "/staff", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteStaff: (id: number) =>
    apiRequest<{ success: boolean }>(`/staff/${id}`, { method: "DELETE" }),
  getFaqs: () => apiRequest<{ items: FaqItem[] }>("/faqs"),
  saveFaq: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/faqs/${id}` : "/faqs", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteFaq: (id: number) =>
    apiRequest<{ success: boolean }>(`/faqs/${id}`, { method: "DELETE" }),
  getFacilities: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<Facility>>(`/facilities${buildQuery(params)}`),
  saveFacility: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/facilities/${id}` : "/facilities", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteFacility: (id: number) =>
    apiRequest<{ success: boolean }>(`/facilities/${id}`, { method: "DELETE" }),
  getTestimonials: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<Testimonial>>(`/testimonials${buildQuery(params)}`),
  saveTestimonial: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/testimonials/${id}` : "/testimonials", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteTestimonial: (id: number) =>
    apiRequest<{ success: boolean }>(`/testimonials/${id}`, { method: "DELETE" }),
  getGalleryItems: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<GalleryItem>>(`/gallery-items${buildQuery(params)}`),
  saveGalleryItem: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/gallery-items/${id}` : "/gallery-items", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  deleteGalleryItem: (id: number) =>
    apiRequest<{ success: boolean }>(`/gallery-items/${id}`, { method: "DELETE" }),
  getEnquiries: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<Enquiry>>(`/enquiries${buildQuery(params)}`),
  updateEnquiry: (id: number, payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean }>(`/enquiries/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getAdmissions: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<AdmissionApplication>>(`/admissions${buildQuery(params)}`),
  updateAdmission: (id: number, payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean }>(`/admissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getUsers: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<AdminUser>>(`/users${buildQuery(params)}`),
  saveUser: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ success: boolean }>(id ? `/users/${id}` : "/users", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
  changeUserPassword: (id: number, password: string) =>
    apiRequest<{ success: boolean }>(`/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
  generateRecoveryKey: (id: number) =>
    apiRequest<{ success: boolean; recovery_key: string; message: string }>(`/users/${id}/recovery-key`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  deleteUser: (id: number) =>
    apiRequest<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
  getActivity: (params: CollectionQuery = {}) => apiRequest<PaginatedResponse<ActivityLogEntry>>(`/activity${buildQuery(params)}`),
  getExportUrl: (entity: "enquiries" | "admissions" | "staff" | "programmes" | "blog-posts") => `${API_BASE_URL}/exports/${entity}`,
  downloadExport: async (entity: "enquiries" | "admissions" | "staff" | "programmes" | "blog-posts") => {
    const response = await fetch(`${API_BASE_URL}/exports/${entity}`, {
      credentials: "include",
      headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || "The export could not be prepared right now.");
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";
    const fileMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    const filename = fileMatch?.[1] || `${entity}.csv`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
  getSettings: () => apiRequest<{ items: Record<string, string> }>("/settings"),
  saveSettings: (payload: Record<string, unknown>) =>
    apiRequest<{ success: boolean }>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
