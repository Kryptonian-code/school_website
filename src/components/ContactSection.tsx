import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { resolveSafeEmbedUrl } from "@/lib/safeLinks";
import { defaultSiteSettings } from "@/lib/siteContent";

const ContactSection = () => {
  const { toast } = useToast();
  const { data } = useSiteContent();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await api.submitEnquiry({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        type: "contact",
      });

      toast({ title: "Message sent!", description: "We will get back to you shortly." });
      event.currentTarget.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const settings = data?.settings ?? {};
  const mapEmbedUrl = resolveSafeEmbedUrl(settings.contact_map_embed_url);

  return (
    <section id="contact" className="section-padding bg-warm-gray">
      <div className="section-container">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">{settings.contact_badge || defaultSiteSettings.contact_badge}</p>
            <h2 className="section-title">{settings.contact_title || defaultSiteSettings.contact_title}</h2>
            <p className="section-subtitle mx-auto">
              {settings.contact_subtitle || defaultSiteSettings.contact_subtitle}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-10">
          <ScrollReveal>
            <div className="space-y-5 mb-8">
              {[
                { icon: MapPin, label: "Visit Us", value: settings.address || defaultSiteSettings.address },
                { icon: Phone, label: "Call Us", value: `${settings.phone || defaultSiteSettings.phone}${settings.alternate_phone ? ` / ${settings.alternate_phone}` : ""}` },
                { icon: Mail, label: "Email Us", value: settings.email || defaultSiteSettings.email },
                { icon: Clock, label: "Office Hours", value: settings.office_hours || defaultSiteSettings.office_hours },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {mapEmbedUrl ? (
              <div className="rounded-xl overflow-hidden border border-border h-60">
                <iframe
                  src={mapEmbedUrl}
                  title="Campus map"
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border h-48 bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Add a map embed URL in admin settings to show the campus location here.</p>
              </div>
            )}
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-6">Send us a message</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <Input id="contact-name" required name="name" placeholder="Kwame Mensah" className="bg-background" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                    <Input id="contact-email" required type="email" name="email" placeholder="kwame@example.com" className="bg-background" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-phone" className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
                  <Input id="contact-phone" name="phone" placeholder="+233 XX XXX XXXX" className="bg-background" />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
                  <Input id="contact-subject" required name="subject" placeholder="Admissions enquiry" className="bg-background" />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                  <Textarea id="contact-message" required name="message" rows={4} placeholder="Tell us how we can help..." className="bg-background resize-none" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  {loading ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
