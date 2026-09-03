import { createServerFn } from "@tanstack/react-start";

import {
  deleteCaseFromConfluenceApi,
  fetchConfluenceSpaces,
  fetchIntegrationsStatus,
  importCaseFromJiraApi,
  searchJiraIssues,
  syncCaseToConfluenceApi,
} from "@/lib/integrations-api";

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $integrationsStatus = createServerFn({ method: "GET" }).handler(async () =>
  fetchIntegrationsStatus(),
);

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $listConfluenceSpaces = createServerFn({ method: "GET" }).handler(async () =>
  fetchConfluenceSpaces(),
);

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $listJiraIssues = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string; limit?: number }) => data)
  .handler(async ({ data }) => searchJiraIssues(data));

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $importCaseFromJira = createServerFn({ method: "POST" })
  .inputValidator((data: { projectUrl: string; availableIntegrations: string[] }) => data)
  .handler(async ({ data }) => importCaseFromJiraApi(data));

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $syncCaseToConfluence = createServerFn({ method: "POST" })
  .inputValidator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => syncCaseToConfluenceApi(data));

/** @deprecated Prefer direct calls from `@/lib/integrations-api` on the client. */
export const $deleteCaseFromConfluence = createServerFn({ method: "POST" })
  .inputValidator((data: { nome: string; responsavelEmail?: string }) => data)
  .handler(async ({ data }) => deleteCaseFromConfluenceApi(data));
