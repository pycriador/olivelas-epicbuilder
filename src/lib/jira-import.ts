import { importCaseFromJiraApi } from "@/lib/integrations-api";
import { apiBaseUrl } from "@/lib/api-base-url";

export { apiBaseUrl } from "@/lib/api-base-url";

/** Resolve relative FastAPI asset paths (/api/jira-*, /api/v1/gallery/*). */
export function resolveApiAssetUrl(path: string): string {
  if (!path || path.startsWith("http") || path.startsWith("data:")) return path;

  const legacyMatch = path.match(/\/api\/jira-attachment\?id=(\d+)/);
  if (legacyMatch?.[1]) {
    return `${apiBaseUrl()}/api/v1/gallery/${legacyMatch[1]}`;
  }

  if (path.startsWith("/api/")) return `${apiBaseUrl()}${path}`;
  return path;
}

export type ImportedCaseDraft = {
  nome: string;
  descricao: string;
  area: string;
  status: string;
  impacto: string;
  cor: string;
  problema: string;
  dores: string[];
  solucao: string;
  etapaAtual?: string;
  statusAtual?: string;
  etapaSeguinte?: string;
  resumoAtualizacao?: string;
  antes: string[];
  depois: string[];
  resultados: { label: string; valor: string; detalhe: string }[];
  galeria: {
    titulo: string;
    descricao: string;
    url: string;
    mimeType?: string;
    origem?: {
      issueKey: string;
      issueType: string;
      issueSummary: string;
    };
  }[];
  integracoesSelecionadas: string[];
  integracoesDetectadas?: {
    nome: string;
    motivo: string;
    citations: {
      issueKey: string;
      issueType: string;
      issueSummary: string;
      field: string;
      quote: string;
    }[];
  }[];
  semIntegracoes: boolean;
  semMetricas: boolean;
  responsavel?: { nome: string; avatarUrl?: string; email?: string };
  /** Status literal do épico no Jira (ex.: "Concluído", "Em andamento"). */
  jiraStatus?: string;
};

export type GalleryOriginMeta = {
  issueKey: string;
  issueType: string;
  issueSummary: string;
};

export type ImportJiraResult = {
  draft: ImportedCaseDraft;
  meta: {
    projectKey?: string;
    projectName?: string;
    issuesCount?: number;
    attachmentsCount?: number;
    baseUrl?: string;
    seedIssueKey?: string;
    epicKey?: string;
    epicSummary?: string;
    scope?: string;
    galleryOrigins?: GalleryOriginMeta[];
  };
};

export async function importCaseFromJira(input: {
  projectUrl: string;
  availableIntegrations: string[];
}): Promise<ImportJiraResult> {
  return importCaseFromJiraApi(input);
}
