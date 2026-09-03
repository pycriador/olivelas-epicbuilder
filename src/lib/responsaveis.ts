import type { CaseItem, Responsavel } from "@/data/types";
import { resolveApiAssetUrl } from "@/lib/jira-import";

/** Responsável do case: preferencialmente o do Jira, senão o primeiro da lista. */
export function responsavelDoCase(item: CaseItem): Responsavel | null {
  if (item.responsavel?.nome?.trim()) return item.responsavel;
  const nome = item.responsaveis?.find((r) => r?.trim());
  return nome ? { nome: nome.trim() } : null;
}

export function nomeResponsavel(item: CaseItem): string {
  return responsavelDoCase(item)?.nome ?? "Sem responsável";
}

/** Versão em alta resolução do avatar do Jira (evita foto embaçada em telas grandes). */
export function avatarEmAltaQualidade(url?: string): string | undefined {
  if (!url) return undefined;
  const resolved = resolveApiAssetUrl(url);
  const upscale = (u: string) =>
    u
      .replace(/(\b|=)(16|24|32|48|64|128)x(16|24|32|48|64|128)\b/g, "$1512x512")
      .replace(/([?&](?:size|width|height|s|w|h)=)\d+/gi, "$1512")
      .replace(/([?&]size=)(x?small|medium|large|xlarge)\b/gi, "$1xxlarge")
      .replace(/\/(16|24|32|48|64|128)(?=$|\?)/, "/512");
  if (!resolved.includes("/api/jira-avatar")) return upscale(resolved);
  const [base, query = ""] = resolved.split("?");
  const params = new URLSearchParams(query);
  const alvo = params.get("u");
  if (!alvo) return resolved;
  params.set("u", upscale(alvo));
  return `${base}?${params.toString()}`;
}

export function iniciaisDe(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const primeira = partes[0]![0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]![0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

/** Considera concluído somente o que está marcado como concluído no Jira. */
const CONCLUIDO_JIRA = /(conclu|done|finaliz|encerrad|closed|resolvid|entregue)/i;

export function isConcluido(item: CaseItem): boolean {
  if (item.jiraStatus?.trim()) return CONCLUIDO_JIRA.test(item.jiraStatus);
  return false;
}

export type GrupoResponsavel = {
  nome: string;
  avatarUrl?: string;
  email?: string;
  cases: CaseItem[];
};

/** Agrupa os cases por responsável, em ordem alfabética. */
export function agruparPorResponsavel(cases: CaseItem[]): GrupoResponsavel[] {
  const mapa = new Map<string, GrupoResponsavel>();
  for (const c of cases) {
    const r = responsavelDoCase(c);
    const nome = r?.nome ?? "Sem responsável";
    const atual = mapa.get(nome);
    if (atual) {
      atual.cases.push(c);
      if (!atual.avatarUrl && r?.avatarUrl) atual.avatarUrl = r.avatarUrl;
      if (!atual.email && r?.email) atual.email = r.email;
    } else {
      mapa.set(nome, {
        nome,
        ...(r?.avatarUrl ? { avatarUrl: r.avatarUrl } : {}),
        ...(r?.email ? { email: r.email } : {}),
        cases: [c],
      });
    }
  }
  return [...mapa.values()].sort((a, b) => {
    if (a.nome === "Sem responsável") return 1;
    if (b.nome === "Sem responsável") return -1;
    return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
  });
}
