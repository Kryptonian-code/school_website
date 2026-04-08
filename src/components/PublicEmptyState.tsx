import { Button } from "@/components/ui/button";
import SafeLink from "@/components/SafeLink";

interface PublicEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const PublicEmptyState = ({
  title,
  description,
  actionLabel = "Contact the school",
  actionHref = "/#contact",
}: PublicEmptyStateProps) => {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card/90 px-6 py-10 text-center shadow-sm">
      <div className="mx-auto max-w-2xl space-y-3">
        <h3 className="font-heading text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
        {actionLabel && actionHref ? (
          <Button asChild variant="outline" className="mt-2 rounded-xl">
            <SafeLink to={actionHref} fallbackTo="/#contact">{actionLabel}</SafeLink>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PublicEmptyState;
