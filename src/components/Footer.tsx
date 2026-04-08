import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import SafeLink from "@/components/SafeLink";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { siteNavItems } from "@/lib/navigation";
import { defaultSiteSettings } from "@/lib/siteContent";

const Footer = () => {
  const { data } = useSiteContent();
  const settings = data?.settings ?? {};
  const schoolName = settings.school_name || defaultSiteSettings.school_name;
  const programmes = data?.programmes ?? [];
  const featuredFooterLinks = programmes.slice(0, 6);
  const socialLinks = [
    { href: settings.facebook_url, icon: Facebook, label: "Facebook" },
    { href: settings.twitter_url, icon: Twitter, label: "Twitter" },
    { href: settings.instagram_url, icon: Instagram, label: "Instagram" },
    { href: settings.youtube_url, icon: Youtube, label: "YouTube" },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="gradient-navy text-primary-foreground">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-heading font-bold text-lg text-secondary-foreground">{schoolName.charAt(0)}</span>
              </div>
              <span className="font-heading font-bold text-xl">{schoolName}</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              {settings.tagline || defaultSiteSettings.tagline}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <SafeLink
                  key={label}
                  to={href}
                  fallbackTo="/"
                  target="_blank"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </SafeLink>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              {siteNavItems.slice(1).map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="hover:text-secondary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{featuredFooterLinks.length > 0 ? "Our Programmes" : "Explore"}</h3>
            <ul className="space-y-2.5 text-sm text-primary-foreground/70">
              {featuredFooterLinks.length > 0 ? (
                featuredFooterLinks.map((programme) => (
                  <li key={programme.slug}>
                    <Link to={`/programmes/${programme.slug}`} className="hover:text-secondary transition-colors">
                      {programme.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/programmes" className="hover:text-secondary transition-colors">View all programmes</Link></li>
                  <li><Link to="/news" className="hover:text-secondary transition-colors">School news</Link></li>
                  <li><Link to="/staff" className="hover:text-secondary transition-colors">Staff directory</Link></li>
                  <li><Link to="/careers" className="hover:text-secondary transition-colors">Careers</Link></li>
                  <li><Link to="/#contact" className="hover:text-secondary transition-colors">Contact the school</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{settings.address || defaultSiteSettings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{settings.phone || defaultSiteSettings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{settings.email || defaultSiteSettings.email}</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-primary-foreground/50 mb-1">Office Hours</p>
              <p className="text-sm text-primary-foreground/70">{settings.office_hours || defaultSiteSettings.office_hours}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/admin/login" className="hover:text-primary-foreground transition-colors">Admin</Link>
            <Link to="/staff" className="hover:text-primary-foreground transition-colors">Staff Directory</Link>
            <Link to="/news" className="hover:text-primary-foreground transition-colors">News</Link>
            <Link to="/careers" className="hover:text-primary-foreground transition-colors">Careers</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
