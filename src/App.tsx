import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import ScrollToHash from "@/components/ScrollToHash";
import { AuthProvider, dashboardRoles, useAuth } from "@/contexts/AuthContext";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { routerBasename } from "@/lib/runtimePaths";
import AdminLayout from "./components/admin/AdminLayout";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProgrammePage = lazy(() => import("./pages/ProgrammePage"));
const ProgrammesPage = lazy(() => import("./pages/ProgrammesPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const CareerPage = lazy(() => import("./pages/CareerPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdmissionApplicationPage = lazy(() => import("./pages/AdmissionApplicationPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const NewsPostPage = lazy(() => import("./pages/NewsPostPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAdmissions = lazy(() => import("./pages/admin/AdminAdmissions"));
const AdminProgrammes = lazy(() => import("./pages/admin/AdminProgrammes"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCareers"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminFacilities = lazy(() => import("./pages/admin/AdminFacilities"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminStaff = lazy(() => import("./pages/admin/AdminStaff"));
const AdminFaqs = lazy(() => import("./pages/admin/AdminFaqs"));
const AdminEnquiries = lazy(() => import("./pages/admin/AdminEnquiries"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient();

const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <p className="text-muted-foreground">Loading page...</p>
  </div>
);

const withPublicContent = (element: React.ReactNode, mode: "full" | "settings" = "settings") => (
  <SiteContentProvider mode={mode}>{element}</SiteContentProvider>
);

const withAdminProviders = (element: React.ReactNode) => (
  <AuthProvider>
    <SiteContentProvider mode="settings">{element}</SiteContentProvider>
  </AuthProvider>
);

const ProtectedRoute = ({ children, allowedRoles = dashboardRoles }: { children: React.ReactNode; allowedRoles?: readonly string[] }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive font-semibold">Access denied. Your role does not have access to this page.</p>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorBoundary>
        <BrowserRouter basename={routerBasename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToHash />
          <Suspense fallback={<AppLoader />}>
            <Routes>
              <Route path="/" element={withPublicContent(<Index />, "full")} />
              <Route path="/programmes" element={withPublicContent(<ProgrammesPage />)} />
              <Route path="/programmes/:slug" element={withPublicContent(<ProgrammePage />)} />
              <Route path="/careers" element={withPublicContent(<CareersPage />)} />
              <Route path="/careers/:slug" element={withPublicContent(<CareerPage />)} />
              <Route path="/news" element={withPublicContent(<NewsPage />)} />
              <Route path="/news/:slug" element={withPublicContent(<NewsPostPage />)} />
              <Route path="/gallery" element={withPublicContent(<GalleryPage />)} />
              <Route path="/staff" element={withPublicContent(<StaffPage />)} />
              <Route path="/admissions/apply" element={withPublicContent(<AdmissionApplicationPage />)} />
              <Route path="/admin/login" element={withAdminProviders(<AdminLogin />)} />
              <Route path="/admin/recover" element={withAdminProviders(<AdminLogin initialMode="recover" />)} />
              <Route path="/admin" element={withAdminProviders(<ProtectedRoute><AdminDashboard /></ProtectedRoute>)} />
              <Route path="/admin/admissions" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "admissions_manager"]}><AdminAdmissions /></ProtectedRoute>)} />
              <Route path="/admin/programmes" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminProgrammes /></ProtectedRoute>)} />
              <Route path="/admin/careers" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminCareers /></ProtectedRoute>)} />
              <Route path="/admin/blog" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminBlog /></ProtectedRoute>)} />
              <Route path="/admin/facilities" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminFacilities /></ProtectedRoute>)} />
              <Route path="/admin/testimonials" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminTestimonials /></ProtectedRoute>)} />
              <Route path="/admin/gallery" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminGallery /></ProtectedRoute>)} />
              <Route path="/admin/staff" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminStaff /></ProtectedRoute>)} />
              <Route path="/admin/faqs" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "editor"]}><AdminFaqs /></ProtectedRoute>)} />
              <Route path="/admin/enquiries" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin", "enquiries_manager"]}><AdminEnquiries /></ProtectedRoute>)} />
              <Route path="/admin/users" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>)} />
              <Route path="/admin/activity" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin"]}><AdminActivity /></ProtectedRoute>)} />
              <Route path="/admin/settings" element={withAdminProviders(<ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>)} />
              <Route path="*" element={withPublicContent(<NotFound />)} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
