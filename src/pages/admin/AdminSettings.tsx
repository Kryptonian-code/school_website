import { useEffect, useMemo, useState } from "react";
import { Globe2, ImageIcon, LayoutPanelTop, PhoneCall, Save, School, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MediaUploadField from "@/components/admin/MediaUploadField";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { AdminField, AdminFormSection, AdminPage, AdminSurface } from "@/components/admin/AdminUI";
import { resolveAssetPath } from "@/lib/runtimePaths";

const defaultSettings = [
  { key: "admin_brand_name", label: "Admin Brand Name", default: "Prestige Admin" },
  { key: "admin_brand_subtitle", label: "Admin Brand Subtitle", default: "School website content desk" },
  { key: "admin_sidebar_badge", label: "Admin Sidebar Badge", default: "Content Manager" },
  { key: "admin_header_label", label: "Admin Header Label", default: "Prestige Academy CMS" },
  { key: "school_name", label: "School Name", default: "Prestige Academy" },
  { key: "tagline", label: "Tagline", default: "Excellence in Education" },
  { key: "phone", label: "Phone Number", default: "+233 30 255 1234" },
  { key: "alternate_phone", label: "Alternate Phone", default: "+233 24 555 6789" },
  { key: "email", label: "Email Address", default: "info@prestigeacademy.edu.gh" },
  { key: "address", label: "Address", default: "15 Academy Drive, East Legon, Accra, Ghana" },
  { key: "office_hours", label: "Office Hours", default: "Monday - Friday: 7:30 AM - 4:30 PM" },
  { key: "facebook_url", label: "Facebook URL", default: "" },
  { key: "twitter_url", label: "Twitter URL", default: "" },
  { key: "instagram_url", label: "Instagram URL", default: "" },
  { key: "youtube_url", label: "YouTube URL", default: "" },
  { key: "whatsapp_number", label: "WhatsApp Number", default: "" },
  { key: "hero_badge", label: "Hero Badge", default: "Trusted by families across Accra" },
  { key: "hero_title", label: "Hero Title", default: "Raising confident learners and future-ready leaders." },
  { key: "hero_subtitle", label: "Hero Subtitle", default: "A warm, high-performing Ghanaian school community where strong academics, character, and creativity grow side by side." },
  { key: "hero_primary_cta_label", label: "Hero Primary CTA Label", default: "Apply Now" },
  { key: "hero_primary_cta_url", label: "Hero Primary CTA URL", default: "/admissions/apply" },
  { key: "hero_secondary_cta_label", label: "Hero Secondary CTA Label", default: "Book a Visit" },
  { key: "hero_secondary_cta_url", label: "Hero Secondary CTA URL", default: "/#contact" },
  { key: "hero_image_url", label: "Hero Image URL", default: "" },
  { key: "about_badge", label: "About Badge", default: "About Us" },
  { key: "about_title", label: "About Title", default: "A Legacy of Excellence Since 1998" },
  { key: "about_subtitle", label: "About Subtitle", default: "Prestige Academy has been shaping the minds of Ghana's future leaders for over 25 years with a values-driven and student-centered education." },
  { key: "mission_title", label: "Mission Title", default: "Our Mission" },
  { key: "mission_body", label: "Mission Body", default: "To provide a transformative educational experience that develops intellectually curious, morally grounded, and socially responsible individuals." },
  { key: "vision_title", label: "Vision Title", default: "Our Vision" },
  { key: "vision_body", label: "Vision Body", default: "To be a leading center of academic excellence in West Africa, known for producing well-rounded graduates who create positive change." },
  { key: "headteacher_label", label: "Headteacher Label", default: "Headteacher's Message" },
  { key: "headteacher_name", label: "Headteacher Name", default: "Mrs. Abena Mensah" },
  { key: "headteacher_title", label: "Headteacher Title", default: "M.Ed, B.Ed - Headteacher" },
  { key: "headteacher_message", label: "Headteacher Message", default: "Every child who walks through our gates carries the potential to make a meaningful difference. Our responsibility is to nurture that potential with care and excellence." },
  { key: "headteacher_image_url", label: "Headteacher Image URL", default: "" },
  { key: "admissions_badge", label: "Admissions Badge", default: "Admissions" },
  { key: "admissions_title", label: "Admissions Title", default: "Begin Your Child's Journey" },
  { key: "admissions_subtitle", label: "Admissions Subtitle", default: "Our admissions process is designed to be simple, transparent, and family-friendly from the first enquiry to enrollment." },
  { key: "admissions_step_1_title", label: "Admissions Step 1 Title", default: "Submit Application" },
  { key: "admissions_step_1_desc", label: "Admissions Step 1 Description", default: "Complete the online application form with student and parent details." },
  { key: "admissions_step_2_title", label: "Admissions Step 2 Title", default: "Review Details" },
  { key: "admissions_step_2_desc", label: "Admissions Step 2 Description", default: "Our admissions team reviews your application and follows up if anything else is needed." },
  { key: "admissions_step_3_title", label: "Admissions Step 3 Title", default: "Assessment & Interview" },
  { key: "admissions_step_3_desc", label: "Admissions Step 3 Description", default: "Eligible applicants are invited for placement support and a brief family interaction." },
  { key: "admissions_step_4_title", label: "Admissions Step 4 Title", default: "Receive Decision" },
  { key: "admissions_step_4_desc", label: "Admissions Step 4 Description", default: "Successful applicants receive their next-step guidance and enrollment information." },
  { key: "cta_title", label: "Bottom CTA Title", default: "Ready to Join the Prestige Academy Family?" },
  { key: "cta_body", label: "Bottom CTA Body", default: "Applications are open and our admissions team is ready to guide you through the next steps." },
  { key: "cta_primary_label", label: "Bottom CTA Primary Label", default: "Apply Now" },
  { key: "cta_primary_url", label: "Bottom CTA Primary URL", default: "/admissions/apply" },
  { key: "cta_secondary_label", label: "Bottom CTA Secondary Label", default: "Call Admissions" },
  { key: "cta_secondary_url", label: "Bottom CTA Secondary URL", default: "/#contact" },
  { key: "contact_badge", label: "Contact Badge", default: "Contact Us" },
  { key: "contact_title", label: "Contact Title", default: "Get in Touch" },
  { key: "contact_subtitle", label: "Contact Subtitle", default: "Have questions about admissions, programmes, or our school? We would love to hear from you." },
  { key: "contact_map_embed_url", label: "Map Embed URL", default: "" },
  { key: "careers_page_title", label: "Careers Page Title", default: "Careers at Prestige Academy" },
  { key: "careers_intro_text", label: "Careers Intro Text", default: "Join a school community that values excellent teaching, strong character, warm collaboration, and long-term student impact." },
  { key: "careers_why_work_title", label: "Why Work With Us Title", default: "Why Work With Us" },
  { key: "careers_why_work_body", label: "Why Work With Us Text", default: "We are building a professional school culture where teachers and support staff are respected, developed, and empowered to do meaningful work every day." },
  { key: "careers_culture_title", label: "Workplace Culture Title", default: "Workplace Culture" },
  { key: "careers_culture_body", label: "Workplace Culture Text", default: "Our teams thrive in a structured, caring environment that values planning, accountability, teamwork, and a genuine commitment to children and families." },
  { key: "careers_benefits_title", label: "Benefits / Compensation Title", default: "Benefits and Compensation" },
  { key: "careers_benefits_body", label: "Benefits / Compensation Text", default: "We aim to offer a fair, supportive employment experience with professional growth opportunities, clear communication, and a healthy working rhythm." },
  { key: "careers_hr_title", label: "HR Contact Title", default: "HR Contact" },
  { key: "careers_hr_body", label: "HR Contact Text", default: "For recruitment questions or partnership enquiries, our HR team is available to guide applicants on the next steps." },
  { key: "careers_hr_email", label: "HR Contact Email", default: "hr@prestigeacademy.edu.gh" },
  { key: "careers_hr_phone", label: "HR Contact Phone", default: "+233 30 255 1234" },
  { key: "careers_cta_text", label: "Careers CTA Text", default: "Explore current opportunities and help shape the future of learning at Prestige Academy." },
];

const settingGroups = [
  {
    id: "admin-branding",
    title: "Admin dashboard branding",
    description: "Editable labels used across the admin login and dashboard shell.",
    icon: LayoutPanelTop,
    keys: ["admin_brand_name", "admin_brand_subtitle", "admin_sidebar_badge", "admin_header_label"],
  },
  {
    id: "school-identity",
    title: "School identity",
    description: "Core brand and contact details used across the public site.",
    icon: School,
    keys: ["school_name", "tagline", "phone", "alternate_phone", "email", "address", "office_hours", "whatsapp_number"],
  },
  {
    id: "social-channels",
    title: "Social channels",
    description: "External links shown in the footer and contact areas.",
    icon: Globe2,
    keys: ["facebook_url", "twitter_url", "instagram_url", "youtube_url"],
  },
  {
    id: "hero-section",
    title: "Hero section",
    description: "Homepage first-impression content and main call-to-action settings.",
    icon: ImageIcon,
    keys: ["hero_badge", "hero_title", "hero_subtitle", "hero_primary_cta_label", "hero_primary_cta_url", "hero_secondary_cta_label", "hero_secondary_cta_url", "hero_image_url"],
  },
  {
    id: "about-section",
    title: "About section",
    description: "School story, mission, vision, and headteacher presentation.",
    icon: Settings2,
    keys: ["about_badge", "about_title", "about_subtitle", "mission_title", "mission_body", "vision_title", "vision_body", "headteacher_label", "headteacher_name", "headteacher_title", "headteacher_message", "headteacher_image_url"],
  },
  {
    id: "admissions-content",
    title: "Admissions content",
    description: "Messaging and step-by-step guidance shown on the admissions section.",
    icon: PhoneCall,
    keys: ["admissions_badge", "admissions_title", "admissions_subtitle", "admissions_step_1_title", "admissions_step_1_desc", "admissions_step_2_title", "admissions_step_2_desc", "admissions_step_3_title", "admissions_step_3_desc", "admissions_step_4_title", "admissions_step_4_desc"],
  },
  {
    id: "calls-to-action",
    title: "Calls to action and contact",
    description: "Bottom CTA and contact section copy visible to prospective families.",
    icon: Globe2,
    keys: ["cta_title", "cta_body", "cta_primary_label", "cta_primary_url", "cta_secondary_label", "cta_secondary_url", "contact_badge", "contact_title", "contact_subtitle", "contact_map_embed_url"],
  },
  {
    id: "careers-page",
    title: "Careers page",
    description: "Employer branding copy, HR contact information, and public careers page messaging.",
    icon: School,
    keys: ["careers_page_title", "careers_intro_text", "careers_why_work_title", "careers_why_work_body", "careers_culture_title", "careers_culture_body", "careers_benefits_title", "careers_benefits_body", "careers_hr_title", "careers_hr_body", "careers_hr_email", "careers_hr_phone", "careers_cta_text"],
  },
];

const getDefaultValue = (key: string) => defaultSettings.find((setting) => setting.key === key)?.default ?? "";
const getLabel = (key: string) => defaultSettings.find((setting) => setting.key === key)?.label ?? key;
const getUploadFolder = (key: string) => {
  if (key === "hero_image_url") return "settings/hero";
  if (key === "headteacher_image_url") return "settings/headteacher";
  return "settings";
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { refetch } = useSiteContent();

  useEffect(() => {
    api.getSettings().then((response) => {
      const next: Record<string, string> = {};
      defaultSettings.forEach((setting) => {
        const incomingValue = response.items[setting.key] || setting.default;
        next[setting.key] = /image_url$/.test(setting.key) ? resolveAssetPath(incomingValue) : incomingValue;
      });
      setSettings(next);
    }).catch(() => undefined);
  }, []);

  const completion = useMemo(() => {
    const configuredFields = defaultSettings.filter((setting) => (settings[setting.key] || "").trim() !== "").length;
    return `${configuredFields} of ${defaultSettings.length} fields configured`;
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveSettings(settings);
      await refetch();
      toast({ title: "Settings saved" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageSettingChange = async (key: string, value: string) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    setSaving(true);

    try {
      await api.saveSettings({ [key]: value });
      await refetch();
      toast({ title: "Image updated", description: `${getLabel(key)} was saved successfully.` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage
      title="Settings"
      description="Configure the public-facing information used across the website. Everything here remains connected to the existing local API and frontend rendering."
      action={(
        <Button onClick={handleSave} disabled={saving} className="rounded-xl shadow-sm">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      )}
      eyebrow="Configuration"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_320px]">
        <div className="space-y-6">
          <AdminFormSection title="Site configuration" description="Open only the settings group you want to work on, then collapse it when you are done.">
            <Accordion type="multiple" defaultValue={["admin-branding", "school-identity", "about-section"]} className="space-y-4">
              {settingGroups.map((group) => (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card/78 px-0 shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-4 text-left hover:no-underline sm:px-5">
                    <div className="flex items-center gap-3 pr-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                        <group.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold tracking-tight text-foreground">{group.title}</p>
                        <p className="text-xs leading-5 text-muted-foreground">{group.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 sm:px-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {group.keys.map((key) => {
                        const isLongField = /(subtitle|body|message|desc|address)/.test(key);
                        const isImageField = /image_url$/.test(key);

                        if (isImageField) {
                          return (
                            <div key={key} className="sm:col-span-2">
                              <MediaUploadField
                                label={getLabel(key)}
                                value={settings[key] || ""}
                                onChange={(value) => handleImageSettingChange(key, value)}
                                folder={getUploadFolder(key)}
                                helperText="Upload an image from your computer. It will be saved to this section immediately."
                              />
                            </div>
                          );
                        }

                        return (
                          <AdminField key={key} label={getLabel(key)} className={isLongField ? "sm:col-span-2" : ""}>
                            {isLongField ? (
                              <Textarea
                                value={settings[key] || ""}
                                onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                                rows={4}
                              />
                            ) : (
                              <Input
                                value={settings[key] || ""}
                                onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                              />
                            )}
                          </AdminField>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AdminFormSection>
        </div>

        <div className="space-y-6">
          <AdminSurface className="p-5 sm:p-6">
            <div className="space-y-3">
              <div className="admin-kicker">Settings progress</div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Configuration overview</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Keep your homepage messaging, school profile, contact details, and admissions copy aligned across the site.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-border/70 bg-card/88 px-4 py-4 shadow-sm">
                <p className="text-sm font-medium text-foreground">Current status</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{completion}</p>
                <p className="mt-1 text-xs text-muted-foreground">Fields are saved directly to your local CMS configuration store.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/88 px-4 py-4 shadow-sm">
                <p className="text-sm font-medium text-foreground">Helpful reminder</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Changes here affect the public site immediately after save, so this panel works best for production-ready wording and accurate school information.
                </p>
              </div>
            </div>
          </AdminSurface>

          <AdminSurface className="p-5 sm:p-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Default references</h2>
              <p className="text-sm text-muted-foreground">These are the current baseline values shipped with the local setup.</p>
            </div>
            <div className="mt-4 space-y-3">
              {["admin_brand_name", "school_name", "tagline", "email", "hero_title"].map((key) => (
                <div key={key} className="rounded-2xl border border-border/70 bg-card/88 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{getLabel(key)}</p>
                  <p className="mt-1 text-sm text-foreground">{getDefaultValue(key)}</p>
                </div>
              ))}
            </div>
          </AdminSurface>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminSettings;
