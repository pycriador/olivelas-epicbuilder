/** Persisted UI layout preference: classic Lovable chrome vs Design Harmony. */

export type LayoutMode = "classic" | "harmony";

export const LAYOUT_MODE_STORAGE_KEY = "aiops-layout-mode";
export const LAYOUT_MODE_CHANGE_EVENT = "aiops-layout-mode-change";

export function isLayoutMode(value: unknown): value is LayoutMode {
  return value === "classic" || value === "harmony";
}

/** Read from localStorage; defaults to harmony (SSR-safe). */
export function readLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "harmony";
  try {
    const raw = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
    return isLayoutMode(raw) ? raw : "harmony";
  } catch {
    return "harmony";
  }
}

/** Persist and notify listeners (same tab + other tabs via storage event). */
export function writeLayoutMode(mode: LayoutMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(
    new CustomEvent<LayoutMode>(LAYOUT_MODE_CHANGE_EVENT, { detail: mode }),
  );
}
