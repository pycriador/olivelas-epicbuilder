import type { GaleriaOrigem } from "@/components/admin/CaseLivePreview";

export type GaleriaOrigemKind =
  | "epic"
  | "story"
  | "subtask"
  | "task"
  | "other";

export type GaleriaOrigemParts = {
  kind: GaleriaOrigemKind;
  /** Short type label in Brazilian Portuguese. */
  typeLabel: string;
  issueKey: string;
  summary: string;
};

export function resolveGaleriaOrigem(
  origem: GaleriaOrigem | undefined,
  epicKey?: string | null,
): GaleriaOrigemParts | null {
  if (!origem?.issueKey) return null;
  const summary = origem.issueSummary?.trim() || origem.issueKey;
  const type = (origem.issueType || "").toLowerCase();
  const isEpic =
    Boolean(epicKey && origem.issueKey === epicKey) ||
    type.includes("épic") ||
    type.includes("epic");

  if (isEpic) {
    return {
      kind: "epic",
      typeLabel: "Diretas no épico",
      issueKey: origem.issueKey,
      summary,
    };
  }
  if (type.includes("histór") || type.includes("story")) {
    return {
      kind: "story",
      typeLabel: "História",
      issueKey: origem.issueKey,
      summary,
    };
  }
  if (type.includes("sub")) {
    return {
      kind: "subtask",
      typeLabel: "Subtarefa",
      issueKey: origem.issueKey,
      summary,
    };
  }
  if (type.includes("tarefa") || type.includes("task")) {
    return {
      kind: "task",
      typeLabel: "Task",
      issueKey: origem.issueKey,
      summary,
    };
  }
  return {
    kind: "other",
    typeLabel: origem.issueType || "Issue",
    issueKey: origem.issueKey,
    summary,
  };
}

/** Single-line label for preview cards / lightbox. */
export function formatGaleriaOrigem(
  origem: GaleriaOrigem | undefined,
  epicKey?: string | null,
): string | null {
  const parts = resolveGaleriaOrigem(origem, epicKey);
  if (!parts) return null;
  return `${parts.typeLabel} · ${parts.issueKey} — ${parts.summary}`;
}

export type GaleriaOrigemGroup = {
  key: string;
  kind: GaleriaOrigemKind;
  typeLabel: string;
  issueKey: string;
  summary: string;
  count: number;
  sort: number;
};

const KIND_SORT: Record<GaleriaOrigemKind, number> = {
  epic: 0,
  story: 1,
  task: 2,
  subtask: 3,
  other: 4,
};

/** Group imported images by Jira issue for the form summary. */
export function groupGaleriaByOrigem(
  items: { origem?: GaleriaOrigem; url: string }[],
  epicKey?: string | null,
): GaleriaOrigemGroup[] {
  const map = new Map<string, GaleriaOrigemGroup>();
  for (const item of items) {
    if (!item.url.trim()) continue;
    const parts = resolveGaleriaOrigem(item.origem, epicKey);
    if (!parts) continue;
    const prev = map.get(parts.issueKey);
    if (prev) {
      prev.count += 1;
      continue;
    }
    map.set(parts.issueKey, {
      key: parts.issueKey,
      kind: parts.kind,
      typeLabel: parts.typeLabel,
      issueKey: parts.issueKey,
      summary: parts.summary,
      count: 1,
      sort: KIND_SORT[parts.kind],
    });
  }
  return [...map.values()].sort(
    (a, b) => a.sort - b.sort || a.issueKey.localeCompare(b.issueKey, "pt-BR"),
  );
}
