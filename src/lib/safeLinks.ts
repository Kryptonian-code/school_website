const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+\-.]*:/i;

const DEFAULT_ALLOWED_EXTERNAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "youtu.be",
  "linkedin.com",
  "wa.me",
  "whatsapp.com",
  "google.com",
  "maps.google.com",
];

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/^\.+/, "");
}

function parseHostAllowlist(input?: string): string[] {
  const configured = (input ?? "")
    .split(",")
    .map((item) => normalizeHost(item))
    .filter(Boolean);

  return [...new Set([...DEFAULT_ALLOWED_EXTERNAL_HOSTS, ...configured])];
}

function hostMatchesAllowlist(hostname: string, allowlist: string[]): boolean {
  const normalizedHost = normalizeHost(hostname);

  return allowlist.some((allowedHost) =>
    normalizedHost === allowedHost || normalizedHost.endsWith(`.${allowedHost}`),
  );
}

function isSafeRelativePath(value: string): boolean {
  return (
    value.startsWith("/")
    || value.startsWith("#")
    || value.startsWith("?")
    || value.startsWith("./")
    || value.startsWith("../")
  ) && !value.startsWith("//");
}

const configuredAllowlist = parseHostAllowlist(import.meta.env.VITE_ALLOWED_EXTERNAL_HOSTS as string | undefined);

export interface SafeHref {
  href: string;
  isExternal: boolean;
}

export function resolveSafeHref(input: string | null | undefined, fallback = "/"): SafeHref {
  const candidate = (input ?? "").trim();
  const fallbackCandidate = fallback.trim() || "/";

  if (!candidate) {
    return resolveSafeHref(fallbackCandidate, "/");
  }

  if (isSafeRelativePath(candidate)) {
    return { href: candidate, isExternal: false };
  }

  if (candidate.startsWith("mailto:") || candidate.startsWith("tel:")) {
    return { href: candidate, isExternal: true };
  }

  if (!ABSOLUTE_URL_PATTERN.test(candidate)) {
    return resolveSafeHref(fallbackCandidate, "/");
  }

  try {
    const url = new URL(candidate, window.location.origin);
    const protocol = url.protocol.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") {
      return resolveSafeHref(fallbackCandidate, "/");
    }

    if (url.origin === window.location.origin) {
      return {
        href: `${url.pathname}${url.search}${url.hash}`,
        isExternal: false,
      };
    }

    if (!hostMatchesAllowlist(url.hostname, configuredAllowlist)) {
      return resolveSafeHref(fallbackCandidate, "/");
    }

    return { href: url.toString(), isExternal: true };
  } catch {
    return resolveSafeHref(fallbackCandidate, "/");
  }
}

export function resolveSafeEmbedUrl(input: string | null | undefined): string | null {
  const candidate = (input ?? "").trim();
  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate, window.location.origin);
    const protocol = url.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") {
      return null;
    }

    if (url.origin === window.location.origin || hostMatchesAllowlist(url.hostname, configuredAllowlist)) {
      return url.toString();
    }

    return null;
  } catch {
    return null;
  }
}
