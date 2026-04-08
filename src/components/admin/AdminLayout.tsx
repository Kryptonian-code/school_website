import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { defaultSiteSettings } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/components/admin/adminConfig";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { data } = useSiteContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleNavItems = adminNavItems.filter((item) => item.roles.includes(user?.role ?? ""));
  const currentPage = visibleNavItems.find((item) => item.href === location.pathname) ?? visibleNavItems[0];
  const settings = data?.settings ?? {};
  const adminBrandName = settings.admin_brand_name || defaultSiteSettings.admin_brand_name;
  const adminBrandSubtitle = settings.admin_brand_subtitle || defaultSiteSettings.admin_brand_subtitle;
  const adminSidebarBadge = settings.admin_sidebar_badge || defaultSiteSettings.admin_sidebar_badge;
  const adminHeaderLabel = settings.admin_header_label || defaultSiteSettings.admin_header_label;
  const brandInitial = adminBrandName.trim().charAt(0) || "P";

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="admin-theme admin-shell-bg min-h-screen text-foreground lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-svh w-[18rem] flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgba(9,39,28,0.98),rgba(12,53,37,0.97))] text-white shadow-[24px_0_60px_-36px_rgba(3,16,11,0.85)] transition-transform overscroll-contain lg:translate-x-0 lg:static lg:h-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 p-5">
          <div className="mb-4 flex items-start justify-between gap-3 lg:block">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 shadow-inner ring-1 ring-white/10">
                <span className="font-heading text-base font-bold text-white">{brandInitial}</span>
              </div>
              <div>
                <span className="block font-heading text-base font-bold tracking-tight text-white">{adminBrandName}</span>
                <span className="text-xs text-white/70">{adminBrandSubtitle}</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary/95">
              <Sparkles className="h-3.5 w-3.5" />
              {adminSidebarBadge}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{currentPage?.label ?? "Dashboard"}</p>
              <p className="mt-1 text-xs leading-5 text-white/72">
                {currentPage?.description ?? "Manage the public school website with confidence."}
              </p>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5 overscroll-contain">
          {visibleNavItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
                  active
                    ? "border-secondary/45 bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_10px_24px_-18px_rgba(245,158,11,0.55)] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-secondary"
                    : "border-transparent text-white hover:border-white/10 hover:bg-white/8 hover:text-white",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    active ? "bg-secondary text-secondary-foreground" : "bg-white/10 text-white group-hover:bg-white/14 group-hover:text-white",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{item.label}</p>
                  <p className={cn("truncate text-[11px]", active ? "text-emerald-50/90" : "text-emerald-50/75 group-hover:text-emerald-50/90")}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user?.display_name}</p>
                <p className="truncate text-xs text-white/72">@{user?.username}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary/95">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="mt-4 w-full justify-start rounded-xl border border-white/10 bg-transparent text-white/88 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/86 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/65">{adminHeaderLabel}</p>
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">{currentPage?.label ?? "Dashboard"}</p>
                <span className="hidden text-muted-foreground sm:inline">/</span>
                <p className="hidden truncate text-sm text-muted-foreground sm:block">{currentPage?.description}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="rounded-full border border-border/70 bg-card/85 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                Signed in as <span className="font-semibold text-foreground">{user?.display_name}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-border/70 bg-card/85 shadow-sm">
                <Link to="/">
                  View Site
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
