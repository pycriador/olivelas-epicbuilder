/**
 * Resolve FastAPI base URL for the current front host.
 *
 * One front image serves both published fronts; the browser picks the API by origin:
 * - aiops-app-model.loft-corp.com.br → corp API
 * - aiops-app-model-front.cross.loft-prod.io → Cross API
 *
 * Login lives on the front (`/login`). The API base has no `/login` path —
 * auth calls use `/api/v1/auth/*` on the chosen host.
 *
 * SSR / unknown hosts fall back to `VITE_API_URL` (prod bake = corp API).
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function hostnameOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function envUrl(key: string): string {
  const raw = import.meta.env[key] as string | undefined;
  return raw ? stripTrailingSlash(raw) : "";
}

/** Map published front hostname → API origin (no path). */
function apiForFrontHostname(hostname: string): string | null {
  const corpApi = envUrl("VITE_CORP_API_URL");
  const crossApi = envUrl("VITE_CROSS_API_URL");
  const corpFrontHost = hostnameOf(envUrl("VITE_CORP_FRONT_URL") || undefined);
  const crossFrontHost = hostnameOf(envUrl("VITE_CROSS_FRONT_URL") || undefined);

  if (corpFrontHost && hostname === corpFrontHost && corpApi) return corpApi;
  if (crossFrontHost && hostname === crossFrontHost && crossApi) return crossApi;

  // Safety net if front URL env was not baked (must match deploy/published-hosts.env).
  if (hostname === "aiops-app-model.loft-corp.com.br" && corpApi) return corpApi;
  if (hostname === "aiops-app-model-front.cross.loft-prod.io" && crossApi) return crossApi;

  return null;
}

/** Base URL for the AI Portal FastAPI backend (scheme + host, no trailing slash). */
export function apiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const mapped = apiForFrontHostname(window.location.hostname);
    if (mapped) return mapped;
  }

  return envUrl("VITE_API_URL") || "http://localhost:8000";
}
