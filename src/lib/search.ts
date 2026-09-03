import type { CaseItem } from "@/data/types";
import { getCachedContent } from "@/lib/content-store";

export type ResultKind = "case";

export interface SearchResult {
  id: string;
  kind: ResultKind;
  titulo: string;
  descricao: string;
  meta: string;
  href: string;
  params?: Record<string, string>;
  score: number;
  tags: string[];
}

export const kindLabel: Record<ResultKind, string> = {
  case: "Cases",
};

const normalize = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const sinonimos: Record<string, string[]> = {
  automacao: ["automatizar", "fluxo", "n8n", "workflow", "robo"],
  automatizar: ["automacao", "fluxo", "n8n"],
  bot: ["agente", "assistente", "chat"],
  agente: ["bot", "assistente", "copilot"],
  ata: ["reuniao", "resumo", "transcricao"],
  reuniao: ["ata", "resumo", "transcricao"],
  cliente: ["feedback", "atendimento", "nps"],
  feedback: ["nps", "cliente", "comentario", "voz do cliente"],
  suporte: ["atendimento", "triagem", "ticket"],
  texto: ["escrita", "conteudo", "copy"],
  conteudo: ["texto", "copy", "escrita", "seo"],
  dados: ["analise", "indicadores", "metricas", "planilha"],
  grafico: ["analise", "indicadores", "dados"],
  busca: ["rag", "embeddings", "pesquisa", "documentacao"],
  documento: ["pdf", "contrato", "extracao"],
  contrato: ["documento", "juridico", "clausula"],
  codigo: ["engenharia", "review", "pull request", "teste"],
  aula: ["curso", "trilha", "aprender", "academy"],
  aprender: ["aula", "trilha", "curso"],
  prompt: ["instrucao", "template"],
  economia: ["horas", "impacto", "produtividade"],
  seguranca: ["guardrails", "risco", "privacidade"],
};

const expand = (tokens: string[]) => {
  const out = new Set(tokens);
  tokens.forEach((t) => sinonimos[t]?.forEach((s) => out.add(normalize(s))));
  return [...out];
};

function buildIndex(cases: CaseItem[]) {
  return cases.map((c) => ({
    id: c.id,
    kind: "case" as const,
    titulo: c.nome,
    descricao: c.descricao,
    meta: `${c.area} · ${c.status}`,
    href: "/cases/$id",
    params: { id: c.id },
    tags: c.tags,
    haystack: normalize(
      [c.nome, c.descricao, c.area, c.time, c.problema, c.solucao, ...c.ferramentas, ...c.tags].join(
        " ",
      ),
    ),
  }));
}

export function search(query: string, limit = 40): SearchResult[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const tokens = expand(q.split(/\s+/).filter((t) => t.length > 2));
  if (!tokens.length) tokens.push(q);

  const index = buildIndex(getCachedContent().cases);

  return index
    .map((item) => {
      let score = 0;
      const titulo = normalize(item.titulo);
      if (titulo.includes(q)) score += 12;
      tokens.forEach((t) => {
        if (titulo.includes(t)) score += 6;
        if (item.tags.some((tag) => normalize(tag).includes(t))) score += 4;
        if (item.haystack.includes(t)) score += 2;
      });
      const { haystack: _h, ...rest } = item;
      return { ...rest, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const groupResults = (results: SearchResult[]) =>
  results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.kind] ||= []).push(r);
    return acc;
  }, {});
