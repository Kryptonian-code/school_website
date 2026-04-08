import { resolveApiBasePath } from "@/lib/runtimePaths";

const API_BASE_URL = resolveApiBasePath(import.meta.env.VITE_API_BASE_URL as string | undefined);
const CLIENT_LOG_ENDPOINT = `${API_BASE_URL}/telemetry/client-error`;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown client error",
  };
}

export function logClientError(error: unknown, context: Record<string, unknown> = {}): void {
  const payload = {
    ...serializeError(error),
    context,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(CLIENT_LOG_ENDPOINT, new Blob([body], { type: "application/json" }));
      if (sent) {
        return;
      }
    }
  } catch {
    // Ignore transport issues and fall through to fetch.
  }

  void fetch(CLIENT_LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
