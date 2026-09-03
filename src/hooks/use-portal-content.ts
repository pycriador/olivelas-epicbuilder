import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import type { Integracao } from "@/data/integracoes";
import { integracaoLogos as staticLogos, integracaoLogoPorNome } from "@/data/logos";
import type { Aula, CaseItem, HubContent, Trilha } from "@/data/types";
import {
  deleteAula as storeDeleteAula,
  deleteCase as storeDeleteCase,
  deleteHubContent as storeDeleteHub,
  deleteIntegracao as storeDeleteIntegracao,
  deleteTrilha as storeDeleteTrilha,
  getAulaStatus,
  getApiError,
  getCachedContent,
  getCustomAreas,
  getCaseMeta,
  hydrateCacheFromDisk,
  refreshContentFromApi,
  setAulaStatus as storeSetAulaStatus,
  type AulaProgresso,
  type CaseMeta,
  type PortalContentSnapshot,
} from "@/lib/content-store";

function byMostRecent<T extends { updatedAt?: string; createdAt?: string; id: string }>(
  a: T,
  b: T,
) {
  const ta = Date.parse(a.updatedAt || a.createdAt || "") || 0;
  const tb = Date.parse(b.updatedAt || b.createdAt || "") || 0;
  if (tb !== ta) return tb - ta;
  return 0;
}

function fromSnapshot(snapshot: PortalContentSnapshot) {
  return {
    cases: [...snapshot.cases].sort(byMostRecent),
    aulas: [...snapshot.aulas].sort(byMostRecent),
    hub: [...snapshot.hub].sort(byMostRecent),
    trilhas: [...snapshot.trilhas],
    integracoes: [...snapshot.integracoes],
    logos: { ...staticLogos, ...snapshot.integracaoLogos },
    areas: snapshot.areas,
  };
}

const empty = {
  cases: [] as CaseItem[],
  aulas: [] as Aula[],
  hub: [] as HubContent[],
  trilhas: [] as Trilha[],
  integracoes: [] as Integracao[],
  logos: staticLogos as Record<string, string>,
  areas: [] as string[],
};

/**
 * Portal content from the FastAPI snapshot API (PostgreSQL).
 * Disk cache paints after mount (avoids SSR/client hydration mismatch);
 * API revalidates in the background (stale-while-revalidate).
 */
export function usePortalContent() {
  const { loading: authLoading, user } = useAuth();

  const [cases, setCases] = useState<CaseItem[]>(empty.cases);
  const [aulas, setAulas] = useState<Aula[]>(empty.aulas);
  const [hub, setHub] = useState<HubContent[]>(empty.hub);
  const [trilhas, setTrilhas] = useState<Trilha[]>(empty.trilhas);
  const [integracoes, setIntegracoes] = useState<Integracao[]>(empty.integracoes);
  const [logos, setLogos] = useState<Record<string, string>>(empty.logos);
  const [areas, setAreas] = useState<string[]>(empty.areas);
  /** True once we have something to paint (disk cache and/or first API response). */
  const [hydrated, setHydrated] = useState(false);
  /** True while a background API refresh is in flight. */
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusTick, setStatusTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const merged = fromSnapshot(getCachedContent());
    setCases(merged.cases);
    setAulas(merged.aulas);
    setHub(merged.hub);
    setTrilhas(merged.trilhas);
    setIntegracoes(merged.integracoes);
    setLogos(merged.logos);
    setAreas(merged.areas);
    setStatusTick((n) => n + 1);
  }, []);

  // Disk hydrate must run after mount — useState initializers that read
  // localStorage diverge from SSR HTML and trigger React #418.
  useEffect(() => {
    const snap = hydrateCacheFromDisk();
    if (snap) {
      const merged = fromSnapshot(snap);
      setCases(merged.cases);
      setAulas(merged.aulas);
      setHub(merged.hub);
      setTrilhas(merged.trilhas);
      setIntegracoes(merged.integracoes);
      setLogos(merged.logos);
      setAreas(merged.areas);
      setHydrated(true);
    }
    setError(getApiError());
  }, []);

  useEffect(() => {
    const onStatus = () => setError(getApiError());
    window.addEventListener("aiportal:api-status", onStatus);
    return () => window.removeEventListener("aiportal:api-status", onStatus);
  }, []);

  useEffect(() => {
    // Wait for auth so the snapshot request carries a valid token.
    if (authLoading) return;

    let active = true;
    setIsRefreshing(true);

    void (async () => {
      try {
        await refreshContentFromApi();
        if (!active) return;
        refresh();
      } catch {
        if (!active) return;
        refresh();
      } finally {
        if (active) {
          setHydrated(true);
          setIsRefreshing(false);
        }
      }
    })();

    const onUpdate = () => refresh();
    window.addEventListener("aiportal:content-updated", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("aiportal:content-updated", onUpdate);
    };
  }, [authLoading, user?.id, refresh]);

  return {
    cases,
    aulas,
    hub,
    trilhas,
    integracoes,
    logos,
    areas,
    hydrated,
    isRefreshing,
    error,
    getCase: (id?: string) => cases.find((c) => c.id === id),
    getAula: (id?: string) => aulas.find((a) => a.id === id),
    getHub: (id?: string) => hub.find((h) => h.id === id),
    getTrilha: (id?: string) => trilhas.find((t) => t.id === id),
    getIntegracao: (id?: string) => integracoes.find((i) => i.id === id),
    aulasDaTrilha: (trilhaId: string) => aulas.filter((a) => a.trilhaId === trilhaId),
    getCaseMeta: (caseId: string): CaseMeta | undefined => getCaseMeta(caseId),
    getAulaProgresso: (aulaId: string, concluidaDefault?: boolean): AulaProgresso => {
      void statusTick;
      return getAulaStatus(aulaId, concluidaDefault);
    },
    setAulaProgresso: (aulaId: string, status: AulaProgresso) => {
      void storeSetAulaStatus(aulaId, status).then(() => refresh());
    },
    statusDaTrilha: (trilhaId: string): AulaProgresso => {
      void statusTick;
      const lista = aulas.filter((a) => a.trilhaId === trilhaId);
      if (!lista.length) return "Não iniciado";
      const statuses = lista.map((a) => getAulaStatus(a.id, a.concluida));
      if (statuses.every((s) => s === "Concluído")) return "Concluído";
      if (statuses.every((s) => s === "Não iniciado")) return "Não iniciado";
      return "Em andamento";
    },
    logoDaIntegracao: (idOrNome: string) => {
      const raw =
        logos[idOrNome] ??
        integracaoLogoPorNome(idOrNome) ??
        logos[
          idOrNome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        ];
      if (!raw) return undefined;
      return raw;
    },
    deleteCase: (id: string) => storeDeleteCase(id).then(() => refresh()),
    deleteAula: (id: string) => storeDeleteAula(id).then(() => refresh()),
    deleteHub: (id: string) => storeDeleteHub(id).then(() => refresh()),
    deleteTrilha: (id: string) => storeDeleteTrilha(id).then(() => refresh()),
    deleteIntegracao: (id: string) => storeDeleteIntegracao(id).then(() => refresh()),
    getCustomAreas: () => (areas.length ? areas : getCustomAreas()),
    refresh,
  };
}
