import {
  deleteCaseFromConfluenceApi,
  syncCaseToConfluenceApi,
  type ConfluenceDeleteResult,
  type ConfluenceSyncResult,
} from "@/lib/integrations-api";
import type { CaseMeta } from "@/lib/content-store";
import type { CaseItem } from "@/data/types";

export type { ConfluenceDeleteResult, ConfluenceSyncResult };

/** Monta o payload da página de status e envia ao Confluence (pasta Status Projetos Olivelas). */
export async function syncCaseToConfluence(
  item: CaseItem,
  meta: CaseMeta,
): Promise<ConfluenceSyncResult> {
  const payload = {
    nome: item.nome,
    descricao: item.descricao,
    area: item.area,
    status: item.status,
    impacto: item.impacto,
    ...(item.jiraStatus ? { jiraStatus: item.jiraStatus } : {}),
    ...(item.responsavel?.nome ? { responsavelNome: item.responsavel.nome } : {}),
    ...(item.responsavel?.email ? { responsavelEmail: item.responsavel.email } : {}),
    ...(meta.jiraEpicKey ? { jiraEpicKey: meta.jiraEpicKey } : {}),
    problema: item.problema,
    solucao: item.solucao,
    ...(item.etapaAtual ? { etapaAtual: item.etapaAtual } : {}),
    ...(item.statusAtual ? { statusAtual: item.statusAtual } : {}),
    ...(item.etapaSeguinte ? { etapaSeguinte: item.etapaSeguinte } : {}),
    dores: meta.dores ?? [],
    antes: item.antes ?? [],
    depois: item.depois ?? [],
    integracoes: meta.integracoes ?? [],
    resultados: item.resultados ?? [],
    atualizacoes: meta.atualizacoes ?? [],
    galeria: (meta.galeria ?? []).map((g) => ({
      titulo: g.titulo,
      descricao: g.descricao ?? "",
      url: g.url,
      ...(g.mimeType ? { mimeType: g.mimeType } : {}),
    })),
  };
  return syncCaseToConfluenceApi(payload);
}

/** Exclui no Confluence a página do projeto (dentro da pasta do e-mail do responsável). */
export async function deleteCaseFromConfluence(item: CaseItem): Promise<ConfluenceDeleteResult> {
  return deleteCaseFromConfluenceApi({
    nome: item.nome,
    ...(item.responsavel?.email ? { responsavelEmail: item.responsavel.email } : {}),
  });
}
