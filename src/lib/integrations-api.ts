import type { ImportJiraResult } from "@/lib/jira-import";
import { apiFetch } from "@/lib/auth-api";

export type IntegrationStatusMap = Record<string, { ok: boolean; detail: string }>;

export type ConfluenceSpace = {
  id: string;
  key: string;
  name: string;
  type: string;
};

export type JiraIssueSummary = {
  key: string;
  summary: string;
  type: string;
  status: string;
};

export type ConfluenceSyncResult = {
  ok: boolean;
  created: boolean;
  folderCreated: boolean;
  pageId?: string;
  url?: string;
  message: string;
};

export type ConfluenceDeleteResult = {
  ok: boolean;
  deleted: boolean;
  message: string;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    if (typeof body.detail === "string") return body.detail;
  } catch {
    /* not JSON */
  }
  return `Request failed (${response.status})`;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await apiFetch(path);
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

export async function fetchIntegrationsStatus(): Promise<IntegrationStatusMap> {
  return apiGet<IntegrationStatusMap>("/api/v1/diagnostics/integrations");
}

export async function fetchConfluenceSpaces(limit = 50): Promise<ConfluenceSpace[]> {
  return apiGet<ConfluenceSpace[]>(`/api/v1/confluence/spaces?limit=${limit}`);
}

export async function searchJiraIssues(input: {
  query: string;
  limit?: number;
}): Promise<JiraIssueSummary[]> {
  return apiPost<JiraIssueSummary[]>("/api/v1/jira/issues/search", input);
}

export async function importCaseFromJiraApi(input: {
  projectUrl: string;
  availableIntegrations: string[];
}): Promise<ImportJiraResult> {
  return apiPost<ImportJiraResult>("/api/v1/jira/import", input);
}

export async function syncCaseToConfluenceApi(
  payload: Record<string, unknown>,
): Promise<ConfluenceSyncResult> {
  return apiPost<ConfluenceSyncResult>("/api/v1/confluence/sync-case", payload);
}

export async function deleteCaseFromConfluenceApi(input: {
  nome: string;
  responsavelEmail?: string;
}): Promise<ConfluenceDeleteResult> {
  return apiPost<ConfluenceDeleteResult>("/api/v1/confluence/delete-case", input);
}
