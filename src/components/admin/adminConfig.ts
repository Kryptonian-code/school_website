import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BriefcaseBusiness,
  Building2,
  FileText,
  GraduationCap,
  Image,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  description: string;
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "editor", "admissions_manager", "enquiries_manager"], description: "Overview and quick access" },
  { label: "Applications", href: "/admin/admissions", icon: ShieldCheck, roles: ["admin", "admissions_manager"], description: "Student admissions queue" },
  { label: "Programmes", href: "/admin/programmes", icon: GraduationCap, roles: ["admin", "editor"], description: "Academic programme content" },
  { label: "Careers", href: "/admin/careers", icon: BriefcaseBusiness, roles: ["admin", "editor"], description: "Vacancies and employer messaging" },
  { label: "Blog Posts", href: "/admin/blog", icon: FileText, roles: ["admin", "editor"], description: "News and updates" },
  { label: "Facilities", href: "/admin/facilities", icon: Building2, roles: ["admin", "editor"], description: "Campus spaces and amenities" },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare, roles: ["admin", "editor"], description: "Parent and student reviews" },
  { label: "Gallery", href: "/admin/gallery", icon: Image, roles: ["admin", "editor"], description: "Public image collections" },
  { label: "Staff", href: "/admin/staff", icon: Users, roles: ["admin", "editor"], description: "Team directory" },
  { label: "FAQs", href: "/admin/faqs", icon: MessageSquare, roles: ["admin", "editor"], description: "Homepage question bank" },
  { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare, roles: ["admin", "enquiries_manager"], description: "Contact form messages" },
  { label: "Users", href: "/admin/users", icon: UserCog, roles: ["admin"], description: "Admin accounts and roles" },
  { label: "Activity", href: "/admin/activity", icon: Activity, roles: ["admin"], description: "Recent admin actions" },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"], description: "Global site configuration" },
];
