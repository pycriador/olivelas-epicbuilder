import type { Aula, CaseItem, HubContent, Trilha } from "@/data/types";
import type { Print } from "@/data/galeria";
import type { Integracao } from "@/data/integracoes";
import { fetchPortalSnapshot, savePortalSnapshot } from "@/lib/portal-api";

export interface CaseMeta {
  dores: string[];
  galeria: Print[];
  integracoes: string[];
  semIntegracoes?: boolean;
  semMetricas?: boolean;
  /** Épico do Jira usado na importação — permite atualizar o case depois. */
  jiraEpicKey?: string;
  /** Histórico de status report (atualizações vindas do Jira). */
  atualizacoes?: { data: string; resumo: string }[];
}

export type StoredCase = CaseItem;
export type StoredIntegracao = Integracao;
export type AulaProgresso = "Não iniciado" | "Em andamento" | "Concluído";

export type PortalContentSnapshot = {
  cases: StoredCase[];
  caseMeta: Record<string, CaseMeta>;
  aulas: Aula[];
  hub: HubContent[];
  trilhas: Trilha[];
  integracoes: StoredIntegracao[];
  integracaoLogos: Record<string, string>;
  areas: string[];
  aulaStatus: Record<string, AulaProgresso>;
  deleted: {
    cases: string[];
    aulas: string[];
    hub: string[];
    trilhas: string[];
    integracoes: string[];
  };
};

const DISK_CACHE_KEY = "aiportal.content.snapshot.v3";

let cache: PortalContentSnapshot = emptySnapshot();
let apiError: string | null = null;
let persistTimer: ReturnType<typeof setTimeout> | undefined;
let persistChain: Promise<void> = Promise.resolve();
let refreshInFlight: Promise<PortalContentSnapshot> | null = null;
/** Epoch ms of last successful API refresh — used to skip remount storms on /admin. */
let lastRefreshAt = 0;
const REFRESH_TTL_MS = 60_000;

function toUserApiError(err: unknown): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Não foi possível conectar ao servidor";
  }
  if (err instanceof Error) return err.message;
  return "Falha ao comunicar com o servidor";
}

function setApiError(message: string | null) {
  apiError = message;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("aiportal:api-status"));
  }
}

export function getApiError(): string | null {
  return apiError;
}

function emptySnapshot(): PortalContentSnapshot {
  return {
    cases: [],
    caseMeta: {},
    aulas: [],
    hub: [],
    trilhas: [],
    integracoes: [],
    integracaoLogos: {},
    areas: [],
    aulaStatus: {},
    deleted: { cases: [], aulas: [], hub: [], trilhas: [], integracoes: [] },
  };
}

function normalizeCase(raw: Partial<CaseItem> & Pick<CaseItem, "id">): CaseItem {
  const area = raw.area?.trim() || "Produto";
  return {
    id: raw.id,
    nome: raw.nome ?? "",
    descricao: raw.descricao ?? "",
    area,
    ferramentas: raw.ferramentas ?? [],
    impacto: raw.impacto ?? "Médio",
    status: raw.status ?? "Em desenvolvimento",
    time: raw.time?.trim() || area,
    responsaveis: raw.responsaveis ?? [],
    ...(raw.responsavel ? { responsavel: raw.responsavel } : {}),
    ...(raw.jiraStatus ? { jiraStatus: raw.jiraStatus } : {}),
    acessos: raw.acessos ?? 0,
    ...(raw.novo ? { novo: raw.novo } : {}),
    ...(raw.destaque ? { destaque: raw.destaque } : {}),
    cor: raw.cor ?? "#3d5a4c",
    problema: raw.problema ?? "",
    solucao: raw.solucao ?? "",
    ...(raw.etapaAtual ? { etapaAtual: raw.etapaAtual } : {}),
    ...(raw.statusAtual ? { statusAtual: raw.statusAtual } : {}),
    ...(raw.etapaSeguinte ? { etapaSeguinte: raw.etapaSeguinte } : {}),
    antes: raw.antes ?? [],
    depois: raw.depois ?? [],
    fluxo: raw.fluxo ?? [],
    etapas: raw.etapas ?? [],
    resultados: raw.resultados ?? [],
    aprendizados: raw.aprendizados ?? [],
    aulasRelacionadas: raw.aulasRelacionadas ?? [],
    templatesRelacionados: raw.templatesRelacionados ?? [],
    ferramentasRelacionadas: raw.ferramentasRelacionadas ?? [],
    casesRelacionados: raw.casesRelacionados ?? [],
    tags: raw.tags ?? [],
    ...(raw.createdAt ? { createdAt: raw.createdAt } : {}),
    ...(raw.updatedAt ? { updatedAt: raw.updatedAt } : {}),
  };
}

function normalizeSnapshot(raw: Partial<PortalContentSnapshot> | null | undefined): PortalContentSnapshot {
  const base = emptySnapshot();
  if (!raw) return base;
  const caseMeta: Record<string, CaseMeta> = {};
  for (const [id, meta] of Object.entries(raw.caseMeta ?? {})) {
    const next: CaseMeta = {
      dores: meta?.dores ?? [],
      galeria: meta?.galeria ?? [],
      integracoes: meta?.integracoes ?? [],
    };
    if (typeof meta?.semIntegracoes === "boolean") next.semIntegracoes = meta.semIntegracoes;
    if (typeof meta?.semMetricas === "boolean") next.semMetricas = meta.semMetricas;
    if (meta?.jiraEpicKey) next.jiraEpicKey = meta.jiraEpicKey;
    if (meta?.atualizacoes?.length) next.atualizacoes = meta.atualizacoes;
    caseMeta[id] = next;
  }
  return {
    cases: (raw.cases ?? [])
      .filter((c): c is CaseItem => Boolean(c && typeof c === "object" && "id" in c && c.id))
      .map((c) => normalizeCase(c)),
    caseMeta,
    aulas: raw.aulas ?? [],
    hub: raw.hub ?? [],
    trilhas: raw.trilhas ?? [],
    integracoes: raw.integracoes ?? [],
    integracaoLogos: raw.integracaoLogos ?? {},
    areas: raw.areas ?? [],
    aulaStatus: (raw.aulaStatus ?? {}) as Record<string, AulaProgresso>,
    deleted: {
      cases: raw.deleted?.cases ?? [],
      aulas: raw.deleted?.aulas ?? [],
      hub: raw.deleted?.hub ?? [],
      trilhas: raw.deleted?.trilhas ?? [],
      integracoes: raw.deleted?.integracoes ?? [],
    },
  };
}

function readStore(storage: Storage): PortalContentSnapshot | null {
  try {
    const raw = storage.getItem(DISK_CACHE_KEY);
    if (!raw) return null;
    return normalizeSnapshot(JSON.parse(raw) as PortalContentSnapshot);
  } catch {
    return null;
  }
}

function writeDiskCache() {
  if (typeof window === "undefined") return;
  let raw: string;
  try {
    raw = JSON.stringify(cache);
  } catch {
    return;
  }
  try {
    window.sessionStorage.setItem(DISK_CACHE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
  try {
    window.localStorage.setItem(DISK_CACHE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
}

function schedulePersist() {
  if (typeof window === "undefined") return;
  writeDiskCache();
  window.dispatchEvent(new CustomEvent("aiportal:content-updated"));
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistChain = persistChain
      .then(() => savePortalSnapshot(cache))
      .then(() => setApiError(null))
      .catch((error) => {
        console.error(error);
        setApiError(toUserApiError(error));
        throw error;
      });
  }, 400);
}

function notify() {
  schedulePersist();
}

/**
 * Hydrate in-memory cache from disk for instant first paint.
 * Prefers sessionStorage (fresher in-tab), then localStorage (survives reload/new tab).
 */
export function hydrateCacheFromDisk(): PortalContentSnapshot | null {
  if (typeof window === "undefined") return null;
  const fromSession = readStore(window.sessionStorage);
  if (fromSession) {
    cache = fromSession;
    return cache;
  }
  const fromLocal = readStore(window.localStorage);
  if (fromLocal) {
    cache = fromLocal;
    try {
      window.sessionStorage.setItem(DISK_CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* ignore */
    }
    return cache;
  }
  return null;
}

/** @deprecated Prefer hydrateCacheFromDisk */
export function hydrateCacheFromSession(): PortalContentSnapshot | null {
  return hydrateCacheFromDisk();
}

/** Load portal content from the API (source of truth). Concurrent calls share one request. */
export async function refreshContentFromApi(options?: {
  force?: boolean;
}): Promise<PortalContentSnapshot> {
  const force = options?.force === true;
  const hasCachedRows =
    cache.cases.length > 0 ||
    cache.integracoes.length > 0 ||
    cache.areas.length > 0 ||
    cache.aulas.length > 0;
  if (
    !force &&
    hasCachedRows &&
    lastRefreshAt > 0 &&
    Date.now() - lastRefreshAt < REFRESH_TTL_MS
  ) {
    return cache;
  }
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      cache = normalizeSnapshot(await fetchPortalSnapshot());
      writeDiskCache();
      lastRefreshAt = Date.now();
      setApiError(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aiportal:content-updated"));
      }
      return cache;
    } catch (err) {
      setApiError(toUserApiError(err));
      throw err;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export function getCachedContent(): PortalContentSnapshot {
  return cache;
}

export function getCustomCases(): StoredCase[] {
  return cache.cases;
}

export async function saveCustomCase(item: StoredCase, meta: CaseMeta) {
  if (item.area.trim()) await saveCustomArea(item.area);
  const withStamp: StoredCase = { ...item, updatedAt: item.updatedAt ?? new Date().toISOString() };
  cache.cases = [withStamp, ...cache.cases.filter((c) => c.id !== item.id)];
  cache.caseMeta[item.id] = { ...meta, galeria: meta.galeria ?? [] };
  cache.deleted.cases = cache.deleted.cases.filter((id) => id !== item.id);
  notify();
}

export function getCaseMeta(caseId: string): CaseMeta | undefined {
  return cache.caseMeta[caseId];
}

export async function deleteCase(id: string) {
  cache.cases = cache.cases.filter((c) => c.id !== id);
  delete cache.caseMeta[id];
  if (!cache.deleted.cases.includes(id)) cache.deleted.cases.push(id);
  notify();
}

export function getDeletedCaseIds(): string[] {
  return cache.deleted.cases;
}

export function getCustomAulas(): Aula[] {
  return cache.aulas;
}

export async function saveCustomAula(aula: Aula) {
  const withStamp: Aula = { ...aula, updatedAt: aula.updatedAt ?? new Date().toISOString() };
  cache.aulas = [withStamp, ...cache.aulas.filter((a) => a.id !== aula.id)];
  cache.deleted.aulas = cache.deleted.aulas.filter((id) => id !== aula.id);
  notify();
}

export async function saveCustomHubContent(item: HubContent) {
  const withStamp: HubContent = {
    ...item,
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cache.hub = [withStamp, ...cache.hub.filter((h) => h.id !== item.id)];
  cache.deleted.hub = cache.deleted.hub.filter((id) => id !== item.id);
  notify();
}

export async function deleteHubContent(id: string) {
  cache.hub = cache.hub.filter((h) => h.id !== id);
  if (!cache.deleted.hub.includes(id)) cache.deleted.hub.push(id);
  notify();
}

export function getCustomHubContents(): HubContent[] {
  return cache.hub;
}

export async function deleteAula(id: string) {
  cache.aulas = cache.aulas.filter((a) => a.id !== id);
  if (!cache.deleted.aulas.includes(id)) cache.deleted.aulas.push(id);
  notify();
}

export function getDeletedAulaIds(): string[] {
  return cache.deleted.aulas;
}

export function getCustomTrilhas(): Trilha[] {
  return cache.trilhas;
}

export async function saveCustomTrilha(trilha: Trilha) {
  cache.trilhas = [trilha, ...cache.trilhas.filter((t) => t.id !== trilha.id)];
  cache.deleted.trilhas = cache.deleted.trilhas.filter((id) => id !== trilha.id);
  notify();
}

export async function deleteTrilha(id: string) {
  cache.trilhas = cache.trilhas.filter((t) => t.id !== id);
  if (!cache.deleted.trilhas.includes(id)) cache.deleted.trilhas.push(id);
  notify();
}

export function getDeletedTrilhaIds(): string[] {
  return cache.deleted.trilhas;
}

export function getCustomIntegracoes(): StoredIntegracao[] {
  return cache.integracoes;
}

export async function saveCustomIntegracao(item: StoredIntegracao, logoUrl?: string) {
  cache.integracoes = [item, ...cache.integracoes.filter((i) => i.id !== item.id)];
  if (logoUrl) cache.integracaoLogos[item.id] = logoUrl;
  cache.deleted.integracoes = cache.deleted.integracoes.filter((id) => id !== item.id);
  notify();
}

export async function deleteIntegracao(id: string) {
  cache.integracoes = cache.integracoes.filter((i) => i.id !== id);
  delete cache.integracaoLogos[id];
  if (!cache.deleted.integracoes.includes(id)) cache.deleted.integracoes.push(id);
  notify();
}

export function getDeletedIntegracaoIds(): string[] {
  return cache.deleted.integracoes;
}

export function getCustomIntegracaoLogos(): Record<string, string> {
  return cache.integracaoLogos;
}

export function getCustomAreas(): string[] {
  return cache.areas;
}

export async function saveCustomArea(nome: string) {
  const clean = nome.trim();
  if (!clean) return;
  cache.areas = [
    ...cache.areas.filter((a) => a.toLowerCase() !== clean.toLowerCase()),
    clean,
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  notify();
}

export async function renameCustomArea(nome: string, novoNome: string) {
  const from = nome.trim();
  const to = novoNome.trim();
  if (!from || !to) return;
  cache.areas = [
    ...cache.areas.filter(
      (a) => a.toLowerCase() !== from.toLowerCase() && a.toLowerCase() !== to.toLowerCase(),
    ),
    to,
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  cache.cases = cache.cases.map((c) =>
    c.area.trim().toLowerCase() === from.toLowerCase() ? { ...c, area: to } : c,
  );
  notify();
}

export async function deleteCustomArea(nome: string, transferTo: string) {
  const clean = nome.trim();
  const target = transferTo.trim();
  if (!clean || !target) return;
  cache.areas = cache.areas.filter((a) => a.toLowerCase() !== clean.toLowerCase());
  cache.cases = cache.cases.map((c) =>
    c.area.trim().toLowerCase() === clean.toLowerCase() ? { ...c, area: target } : c,
  );
  notify();
}

export function getAulaStatuses(): Record<string, AulaProgresso> {
  return cache.aulaStatus;
}

export function getAulaStatus(aulaId: string, concluidaDefault?: boolean): AulaProgresso {
  const saved = cache.aulaStatus[aulaId];
  if (saved) return saved;
  return concluidaDefault ? "Concluído" : "Não iniciado";
}

export async function setAulaStatus(aulaId: string, status: AulaProgresso) {
  cache.aulaStatus[aulaId] = status;
  notify();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
