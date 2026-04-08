import type { LucideIcon } from "lucide-react";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const adminSelectClassName =
  "flex h-11 w-full rounded-xl border border-border/80 bg-card/95 px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const adminIconButtonClassName =
  "h-9 w-9 rounded-xl border border-border/70 bg-background/80 text-muted-foreground shadow-sm hover:border-primary/20 hover:bg-primary/5 hover:text-primary";

export const adminDialogContentClassName =
  "max-h-[88vh] overflow-y-auto rounded-[1.5rem] border border-border/70 bg-background/95 p-0 shadow-[0_30px_90px_-42px_rgba(15,23,42,0.55)]";

export const adminFormClassName =
  "space-y-5 p-6 sm:p-7 [&_label]:mb-2 [&_label]:block [&_label]:text-sm [&_label]:font-bold [&_label]:tracking-tight [&_label]:text-foreground";

export const adminCheckboxRowClassName =
  "flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-foreground";

interface AdminPageProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  eyebrow?: string;
}

export function AdminPage({ title, description, action, children, eyebrow = "School CMS" }: AdminPageProps) {
  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="admin-surface relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_left,rgba(30,64,175,0.14),transparent_35%)]" />
        <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2.5">
            <div className="admin-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <div className="space-y-1.5">
              <h1 className="admin-page-title">{title}</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p>
            </div>
          </div>
          {action ? <div className="flex w-full shrink-0 flex-wrap items-center gap-3 lg:w-auto lg:justify-end">{action}</div> : null}
        </div>
      </section>
      {children}
    </div>
  );
}

export function AdminSurface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("admin-surface", className)}>{children}</section>;
}

export function AdminPanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6", className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex w-full items-center gap-3 sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  detail,
  tone = "navy",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  detail?: string;
  tone?: "navy" | "gold" | "emerald" | "blue" | "rose" | "violet";
}) {
  const toneClassNames: Record<NonNullable<typeof tone>, string> = {
    navy: "bg-primary/14 text-primary ring-primary/20",
    gold: "bg-secondary/18 text-secondary-foreground ring-secondary/20",
    emerald: "bg-emerald-500/18 text-emerald-100 ring-emerald-500/25",
    blue: "bg-sky-500/18 text-sky-100 ring-sky-500/25",
    rose: "bg-rose-500/16 text-rose-100 ring-rose-500/25",
    violet: "bg-violet-500/16 text-violet-100 ring-violet-500/25",
  };

  return (
    <div className="admin-soft-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
          </div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl ring-1", toneClassNames[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function AdminQuickLink({
  to,
  label,
  description,
  icon: Icon,
}: {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/88 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function AdminField({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <label className="text-sm font-bold tracking-tight text-foreground">{label}</label>
        {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.25rem] border border-border/70 bg-card/82 p-4 shadow-sm sm:p-5", className)}>
      <div className="mb-4 space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminBooleanRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={adminCheckboxRowClassName}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span className="space-y-1">
        <span className="block font-medium text-foreground">{label}</span>
        <span className="block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const toneClassNames = {
    neutral: "border-border/70 bg-muted/70 text-foreground/85",
    info: "border-sky-500/25 bg-sky-500/15 text-sky-100",
    success: "border-emerald-500/25 bg-emerald-500/15 text-emerald-100",
    warning: "border-amber-500/25 bg-amber-500/18 text-amber-100",
    danger: "border-rose-500/25 bg-rose-500/16 text-rose-100",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize tracking-wide", toneClassNames[tone])}>
      {children}
    </span>
  );
}

export function AdminTablePagination({
  page,
  pageCount,
  onPrevious,
  onNext,
}: {
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:px-6">
      <p className="text-sm text-muted-foreground">Page {page} of {pageCount}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-xl border-border/70 bg-card/90" disabled={page === 1} onClick={onPrevious}>Previous</Button>
        <Button variant="outline" size="sm" className="rounded-xl border-border/70 bg-card/90" disabled={page === pageCount} onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

export function AdminDeleteButton({
  label,
  description,
  onConfirm,
  trigger,
  confirmLabel = "Delete",
}: {
  label: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  trigger: React.ReactNode;
  confirmLabel?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-[1.25rem] border border-border/80 bg-background/98 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminExportButton({
  entity,
  label = "Export CSV",
}: {
  entity: "enquiries" | "admissions" | "staff" | "programmes" | "blog-posts";
  label?: string;
}) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      await api.downloadExport(entity);
      toast({ title: "Export ready", description: "Your CSV download should begin automatically." });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "The CSV export could not be completed.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" className="rounded-xl" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
