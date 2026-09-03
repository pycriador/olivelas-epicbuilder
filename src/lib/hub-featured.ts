import type { HubContent } from "@/data/types";

const FEATURED_KEY = "aiportal.hub.featuredIds";

function byMostRecent(a: HubContent, b: HubContent) {
  const ta = Date.parse(a.updatedAt || a.createdAt || "") || 0;
  const tb = Date.parse(b.updatedAt || b.createdAt || "") || 0;
  if (tb !== ta) return tb - ta;
  return 0;
}

/** Manual picks for the AI Hub "Em destaque" grid (1 large + 3 side). */
export function getHubFeaturedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FEATURED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string").slice(0, 4);
  } catch {
    return [];
  }
}

export function setHubFeaturedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  const clean = [...new Set(ids.filter(Boolean))].slice(0, 4);
  window.localStorage.setItem(FEATURED_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("aiportal:content-updated"));
}

/**
 * Resolve up to `limit` featured items:
 * - Slot 0 (large card): first admin pick, else most recent
 * - Side slots: remaining admin picks, then most recent publishes
 */
export function resolveFeaturedHubItems(
  hub: HubContent[],
  limit = 4,
  slotIds?: string[],
): HubContent[] {
  const eligible = hub.filter((h) => h.kind !== "video");
  const byId = new Map(eligible.map((h) => [h.id, h]));
  const ids = (slotIds ?? getHubFeaturedIds()).filter(Boolean);
  const recent = [...eligible].sort(byMostRecent);

  const main =
    (ids[0] ? byId.get(ids[0]) : undefined) ??
    recent.find((h) => h.destaque) ??
    recent[0];

  if (!main) return [];

  const picked: HubContent[] = [main];
  const seen = new Set<string>([main.id]);

  for (const id of ids.slice(1)) {
    const item = byId.get(id);
    if (!item || seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
    if (picked.length >= limit) return picked;
  }

  for (const item of recent) {
    if (seen.has(item.id)) continue;
    picked.push(item);
    seen.add(item.id);
    if (picked.length >= limit) break;
  }

  return picked;
}

/** Pick related cards when the item has no explicit relacionados list. */
export function resolveRelatedHubItems(
  item: HubContent,
  hub: HubContent[],
  limit = 3,
): HubContent[] {
  const explicit = (item.relacionados ?? [])
    .map((id) => hub.find((h) => h.id === id))
    .filter((h): h is HubContent => {
      if (!h) return false;
      return h.id !== item.id && h.kind !== "video";
    })
    .slice(0, limit);

  if (explicit.length >= limit) return explicit;

  const seen = new Set(explicit.map((h) => h.id));
  seen.add(item.id);
  const tagSet = new Set(item.tags.map((t) => t.toLowerCase()));

  const scored = hub
    .filter((h) => h.kind !== "video" && !seen.has(h.id))
    .map((h) => {
      const tagScore = h.tags.reduce(
        (n, t) => n + (tagSet.has(t.toLowerCase()) ? 1 : 0),
        0,
      );
      const kindScore = h.kind === item.kind ? 2 : 0;
      const recent =
        Date.parse(h.updatedAt || h.createdAt || "") || 0;
      return { h, score: tagScore * 3 + kindScore, recent };
    })
    .sort((a, b) => b.score - a.score || b.recent - a.recent)
    .map((x) => x.h);

  return [...explicit, ...scored].slice(0, limit);
}
