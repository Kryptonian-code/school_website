const HTTP_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

function normalizeBasePath(value?: string | null): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") {
    return "";
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

const shouldUseConfiguredBasePath = !import.meta.env.DEV && import.meta.env.MODE !== "test";
const configuredBasePath = normalizeBasePath(
  shouldUseConfiguredBasePath ? (import.meta.env.VITE_APP_BASE_PATH as string | undefined) : "",
);
const configuredAssetBasePath = normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH as string | undefined);

export const appBasePath = configuredBasePath;
export const routerBasename = configuredBasePath || undefined;

export function withAppBasePath(value: string): string {
  if (!value || !configuredBasePath) {
    return value;
  }

  if (
    HTTP_URL_PATTERN.test(value)
    || value.startsWith("data:")
    || value.startsWith("blob:")
    || value.startsWith("mailto:")
    || value.startsWith("tel:")
    || value.startsWith("#")
  ) {
    return value;
  }

  if (value === "/") {
    return `${configuredBasePath}/`;
  }

  if (value.startsWith(configuredBasePath + "/") || value === configuredBasePath) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${configuredBasePath}${value}`;
  }

  return `${configuredBasePath}/${value.replace(/^\/+/, "")}`;
}

export function resolveAssetPath(value: string): string {
  if (!value) {
    return value;
  }

  if (
    HTTP_URL_PATTERN.test(value)
    || value.startsWith("data:")
    || value.startsWith("blob:")
    || value.startsWith("mailto:")
    || value.startsWith("tel:")
    || value.startsWith("#")
  ) {
    return value;
  }

  if (import.meta.env.DEV) {
    if (configuredAssetBasePath && (value === configuredAssetBasePath || value.startsWith(configuredAssetBasePath + "/"))) {
      const stripped = value.slice(configuredAssetBasePath.length);
      return stripped || "/";
    }

    return value;
  }

  return withAppBasePath(value);
}

export function resolveApiBasePath(explicitBasePath?: string): string {
  const trimmed = explicitBasePath?.trim();
  const normalizedExplicit = trimmed ? trimmed.replace(/\/+$/, "") : "";

  if (!normalizedExplicit) {
    return withAppBasePath("/backend");
  }

  if (!configuredBasePath || !normalizedExplicit.startsWith("/")) {
    return normalizedExplicit;
  }

  if (normalizedExplicit === configuredBasePath || normalizedExplicit.startsWith(configuredBasePath + "/")) {
    return normalizedExplicit;
  }

  return withAppBasePath(normalizedExplicit);
}
