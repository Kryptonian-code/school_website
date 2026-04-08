import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SafeLink from "@/components/SafeLink";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { siteNavItems } from "@/lib/navigation";
import { defaultSiteSettings } from "@/lib/siteContent";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};
  const schoolName = settings.school_name || defaultSiteSettings.school_name;
  const tagline = settings.tagline || defaultSiteSettings.tagline;
  const phone = settings.phone || defaultSiteSettings.phone;
  const email = settings.email || defaultSiteSettings.email;
  const visitUrl = settings.hero_secondary_cta_url || defaultSiteSettings.hero_secondary_cta_url;
  const visitLabel = settings.hero_secondary_cta_label || defaultSiteSettings.hero_secondary_cta_label;
  const applyUrl = settings.hero_primary_cta_url || defaultSiteSettings.hero_primary_cta_url;
  const applyLabel = settings.hero_primary_cta_label || defaultSiteSettings.hero_primary_cta_label;

  return (
    <>
      <div className="gradient-navy hidden md:block">
        <div className="section-container flex items-center justify-between py-2.5 xl:py-3 text-[15px] xl:text-base text-primary-foreground/85">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/staff" className="hover:text-primary-foreground transition-colors">Meet Our Staff</Link>
            <Link to="/admin/login" className="hover:text-primary-foreground transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="section-container flex items-center justify-between h-16 md:h-20 xl:h-24 2xl:h-28">
          <Link to="/#home" className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 rounded-full gradient-navy flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-heading font-bold text-lg md:text-xl xl:text-2xl">
                {schoolName.charAt(0)}
              </span>
            </div>
            <div>
              <span className="font-heading font-bold text-lg md:text-xl xl:text-2xl 2xl:text-[1.7rem] text-primary leading-none block">
                {schoolName}
              </span>
              <span className="text-sm xl:text-[15px] text-muted-foreground hidden sm:block">{tagline}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 2xl:gap-3">
            {siteNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-3 xl:px-4 py-2.5 text-[15px] xl:text-base 2xl:text-[1.05rem] font-semibold text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-[15px] xl:text-base font-semibold px-5 xl:px-6 h-10 xl:h-11">
              <SafeLink to={visitUrl} fallbackTo="/#contact">{visitLabel}</SafeLink>
            </Button>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-[15px] xl:text-base font-semibold px-5 xl:px-6 h-10 xl:h-11">
              <SafeLink to={applyUrl} fallbackTo="/admissions/apply">{applyLabel}</SafeLink>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card animate-fade-in">
            <nav className="section-container py-4 flex flex-col gap-1">
              {siteNavItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-foreground/80 hover:text-primary hover:bg-muted rounded-md transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <Button asChild variant="outline" className="border-primary text-primary">
                  <SafeLink to={visitUrl} fallbackTo="/#contact">{visitLabel}</SafeLink>
                </Button>
                <Button asChild className="bg-secondary text-secondary-foreground font-semibold">
                  <SafeLink to={applyUrl} fallbackTo="/admissions/apply">{applyLabel}</SafeLink>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
