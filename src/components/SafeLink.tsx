import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { resolveSafeHref } from "@/lib/safeLinks";

interface SafeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string | null | undefined;
  fallbackTo?: string;
  children: ReactNode;
}

const SafeLink = forwardRef<HTMLAnchorElement, SafeLinkProps>(function SafeLink(
  { to, fallbackTo = "/", children, rel, target, ...props },
  ref,
) {
  const { href, isExternal } = resolveSafeHref(to, fallbackTo);

  if (isExternal) {
    const resolvedRel = target === "_blank"
      ? rel ?? "noopener noreferrer"
      : rel;

    return (
      <a ref={ref} href={href} rel={resolvedRel} target={target} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link ref={ref} to={href} {...props}>
      {children}
    </Link>
  );
});

export default SafeLink;
