import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { defaultSiteSettings } from "@/lib/siteContent";

type AdminLoginMode = "signin" | "recover";

const AdminLogin = ({ initialMode = "signin" }: { initialMode?: AdminLoginMode }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AdminLoginMode>(initialMode);
  const { signIn } = useAuth();
  const { data } = useSiteContent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const settings = data?.settings ?? {};
  const adminBrandName = settings.admin_brand_name || defaultSiteSettings.admin_brand_name;
  const adminBrandSubtitle = settings.admin_brand_subtitle || defaultSiteSettings.admin_brand_subtitle;
  const adminHeaderLabel = settings.admin_header_label || defaultSiteSettings.admin_header_label;
  const brandInitial = adminBrandName.trim().charAt(0) || "P";

  useEffect(() => {
    api.getSetupStatus()
      .then((response) => setHasAdmin(response.has_admin))
      .catch(() => setHasAdmin(true));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (hasAdmin === false) {
        await api.bootstrapAdmin({
          username,
          display_name: displayName,
          email,
          password,
        });
        toast({ title: "Admin account created", description: "You can now sign in with your new credentials." });
        setHasAdmin(true);
        setPassword("");
        setMode("signin");
      } else if (mode === "recover") {
        const response = await api.recoverPassword({
          username,
          recovery_key: recoveryKey,
          password,
        });
        toast({ title: "Password reset complete", description: response.message });
        setRecoveryKey("");
        setPassword("");
        setMode("signin");
      } else {
        await signIn(username, password);
        navigate("/admin");
      }
    } catch (error) {
      toast({
        title: hasAdmin === false ? "Setup failed" : mode === "recover" ? "Recovery failed" : "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden gradient-navy flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute top-[18%] right-[6%] h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.04)_0%,transparent_35%,transparent_70%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <div className="absolute top-6 left-4 right-4 z-10 flex justify-between items-center">
        <Button asChild variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary backdrop-blur-sm">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Link>
        </Button>
        <div className="hidden md:flex items-center gap-2 text-primary-foreground/70 text-sm">
          <ShieldCheck className="h-4 w-4 text-secondary" />
          Secure local admin access
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="hidden lg:block text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/85 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-secondary" />
            {adminHeaderLabel}
          </div>
          <h1 className="text-5xl xl:text-6xl font-heading font-extrabold leading-[0.95] max-w-xl">
            Manage your school website with confidence.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-primary-foreground/75 leading-relaxed">
            Sign in to update programmes, admissions, staff profiles, gallery content, school settings, and the main public landing page.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-xl">
            {[
              "Admissions and enquiry responses",
              "Homepage and settings control",
              "Staff, gallery, and testimonials",
              "Protected local CMS access",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-primary-foreground/85">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md lg:max-w-none mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-[1.75rem] bg-secondary flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-secondary/20">
              <span className="font-heading font-bold text-3xl text-secondary-foreground">{brandInitial}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
              {hasAdmin === false ? `Create ${adminBrandName}` : adminBrandName}
            </h1>
            <p className="text-primary-foreground/70 text-base mt-2 max-w-sm mx-auto">
              {hasAdmin === false ? "Set up secure access for your local CMS and start managing the live content." : adminBrandSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card/95 backdrop-blur-xl rounded-[1.75rem] p-8 md:p-9 shadow-2xl border border-primary-foreground/10">
            {hasAdmin !== false ? (
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted/70 p-1">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("recover")}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${mode === "recover" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Recover Access
                </button>
              </div>
            ) : null}
            <div className="space-y-5">
              {hasAdmin === false && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        required
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        autoComplete="name"
                        placeholder="Site Administrator"
                        className="pl-10 bg-background h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Recovery Email</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        placeholder="admin@school.org"
                        className="pl-10 bg-background h-12"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="pl-10 bg-background h-12"
                  />
                </div>
              </div>
              {mode === "recover" && hasAdmin !== false ? (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Recovery Key</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      value={recoveryKey}
                      onChange={(event) => setRecoveryKey(event.target.value.toUpperCase())}
                      placeholder="ABCDE-FGHIJ-KLMNO-PQRST"
                      className="pl-10 bg-background h-12 uppercase tracking-[0.18em]"
                    />
                  </div>
                </div>
              ) : null}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{mode === "recover" && hasAdmin !== false ? "New Password" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={hasAdmin === false || mode === "recover" ? "new-password" : "current-password"}
                    className="pl-10 bg-background h-12"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base">
                {loading
                  ? (hasAdmin === false ? "Creating Admin..." : mode === "recover" ? "Resetting Password..." : "Signing in...")
                  : (hasAdmin === false ? "Create Admin Account" : mode === "recover" ? "Reset Password" : "Sign In")}
              </Button>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hasAdmin === false
                  ? "This setup screen only appears when no admin account exists in the local database."
                  : mode === "recover"
                    ? "Use a recovery key that was generated for your account in the Users screen. Each key works once and should be stored securely offline."
                    : "Use the administrator username and password created for this installation to access the dashboard."}
              </p>
            </div>
          </form>

          <p className="text-center text-primary-foreground/60 text-sm mt-5">
            Need to review the public pages first? <Link to="/" className="text-secondary font-semibold hover:underline">Return to the homepage</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
