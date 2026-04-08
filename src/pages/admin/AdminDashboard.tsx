import { useEffect, useMemo, useState } from "react";
import { CalendarClock, FileText, GraduationCap, MessageSquare, Settings, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { DashboardStats, SystemHealth } from "@/types/content";
import { AdminPage, AdminQuickLink, AdminStatCard, AdminStatusBadge, AdminSurface } from "@/components/admin/AdminUI";
import { adminNavItems } from "@/components/admin/adminConfig";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardStats>({
    enquiries: 0,
    admissions: 0,
    programmes: 0,
    blog_posts: 0,
    staff: 0,
    faqs: 0,
  });
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setCounts).catch(() => undefined);
    api.getSystemHealth().then(setHealth).catch(() => undefined);
  }, []);

  const visibleNavItems = adminNavItems.filter((item) => item.roles.includes(user?.role ?? ""));

  const stats = [
    { label: "Enquiries", value: counts.enquiries, icon: MessageSquare, tone: "blue" as const, detail: "Messages from the public contact form" },
    { label: "Applications", value: counts.admissions, icon: ShieldCheck, tone: "emerald" as const, detail: "Admissions awaiting review and follow-up" },
    { label: "Programmes", value: counts.programmes, icon: GraduationCap, tone: "gold" as const, detail: "Academic offerings currently published" },
    { label: "Blog Posts", value: counts.blog_posts, icon: FileText, tone: "navy" as const, detail: "News stories and website updates" },
    { label: "Staff", value: counts.staff, icon: Users, tone: "rose" as const, detail: "Profiles visible across the school website" },
    { label: "FAQs", value: counts.faqs, icon: MessageSquare, tone: "violet" as const, detail: "Common questions available to families" },
  ];

  const workloadSummary = useMemo(() => {
    const inboxTotal = counts.enquiries + counts.admissions;
    const contentTotal = counts.programmes + counts.blog_posts + counts.staff + counts.faqs;

    return [
      {
        label: "Operational Inbox",
        value: inboxTotal,
        description: "Enquiries and admissions currently in the system.",
        tone: inboxTotal > 0 ? "info" as const : "neutral" as const,
      },
      {
        label: "Published Content",
        value: contentTotal,
        description: "Core content modules the public site depends on.",
        tone: contentTotal > 0 ? "success" as const : "neutral" as const,
      },
    ];
  }, [counts]);

  return (
    <AdminPage
      title="Dashboard"
      description="Overview of your school website content, admissions activity, and day-to-day admin priorities."
      action={(
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl border-border/70 bg-card/88 shadow-sm">
            <Link to="/">
              View Public Site
            </Link>
          </Button>
          <Button asChild className="rounded-xl shadow-sm">
            <Link to="/admin/settings">
              Site Settings
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
      eyebrow="Admin overview"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
        <div className="space-y-5">
          <AdminSurface className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="admin-kicker">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Welcome back
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {user?.display_name ? `${user.display_name}, here is your school website snapshot.` : "Here is your school website snapshot."}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Use this space to monitor incoming family activity, keep website content current, and jump straight into the sections that need attention.
                  </p>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:w-[18rem] lg:grid-cols-1">
                {workloadSummary.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/70 bg-card/88 px-4 py-3.5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <AdminStatusBadge tone={item.tone}>{item.value}</AdminStatusBadge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </AdminSurface>

          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <AdminStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                tone={stat.tone}
                detail={stat.detail}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <AdminSurface>
            <div className="border-b border-border/70 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Quick actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Go straight to the areas you manage most often.</p>
            </div>
            <div className="grid gap-3 px-5 py-4 sm:px-6">
              {visibleNavItems.slice(1, 6).map((item) => (
                <AdminQuickLink
                  key={item.href}
                  to={item.href}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                />
              ))}
            </div>
          </AdminSurface>

          <AdminSurface className="p-5 sm:p-6">
            <div className="space-y-3.5">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Operational focus</h2>
                <p className="text-sm text-muted-foreground">A concise summary built from the real data currently in your CMS.</p>
              </div>
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-border/70 bg-card/82 px-4 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Admissions queue</p>
                      <p className="text-sm text-muted-foreground">Applications submitted by prospective families.</p>
                    </div>
                    <AdminStatusBadge tone={counts.admissions > 0 ? "warning" : "neutral"}>{counts.admissions}</AdminStatusBadge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/82 px-4 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Enquiry inbox</p>
                      <p className="text-sm text-muted-foreground">Messages received from the website contact section.</p>
                    </div>
                    <AdminStatusBadge tone={counts.enquiries > 0 ? "info" : "neutral"}>{counts.enquiries}</AdminStatusBadge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/82 px-4 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Content coverage</p>
                      <p className="text-sm text-muted-foreground">Programmes, blog, staff, and FAQs available to site visitors.</p>
                    </div>
                    <AdminStatusBadge tone="success">{counts.programmes + counts.blog_posts + counts.staff + counts.faqs}</AdminStatusBadge>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/82 px-4 py-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">System health</p>
                      <p className="text-sm text-muted-foreground">Uploads, session security, and recovery readiness.</p>
                    </div>
                    <AdminStatusBadge tone={health?.uploads.writable && health?.security.site_origin_configured ? "success" : "warning"}>
                      {health?.uploads.writable && health?.security.site_origin_configured ? "Healthy" : "Review"}
                    </AdminStatusBadge>
                  </div>
                  {health ? (
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                      <p>Uploads writable: <span className="font-medium text-foreground">{health.uploads.writable ? "Yes" : "No"}</span></p>
                      <p>Secure session cookie: <span className="font-medium text-foreground">{health.session.cookie_secure ? "Yes" : "No"}</span></p>
                      <p>Recovery keys ready: <span className="font-medium text-foreground">{health.security.recovery_keys_ready}</span></p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </AdminSurface>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminDashboard;
