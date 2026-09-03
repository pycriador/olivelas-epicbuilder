/** Dashboard / system screenshots for case galleries (public Unsplash). */
const DASHBOARDS = [
  {
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    titulo: "Painel de indicadores",
    descricao:
      "Dashboard com métricas em tempo real: volume processado, taxa de acerto e distribuição por tema. Tela que o time abre no início do dia.",
  },
  {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    titulo: "Análise operacional",
    descricao:
      "Visão analítica do fluxo: funis, tendências semanais e pontos de atenção destacados pela IA para priorização do time.",
  },
  {
    url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=80",
    titulo: "Console do sistema",
    descricao:
      "Interface do sistema integrado onde a solução roda: filas, status das execuções e logs resumidos para operação.",
  },
  {
    url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1400&q=80",
    titulo: "Monitoramento de fluxos",
    descricao:
      "Monitor do pipeline de automação: etapas concluídas, falhas e tempo médio por execução, com alertas para o time.",
  },
  {
    url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1400&q=80",
    titulo: "Relatório gerencial",
    descricao:
      "Relatório consolidado enviado aos stakeholders: resultados do período, itens revisados e evolução das métricas.",
  },
  {
    url: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1400&q=80",
    titulo: "Configuração de integrações",
    descricao:
      "Painel de configuração: sistemas conectados, chaves e toggles que o time liga ou desliga sem depender de código.",
  },
] as const;

export interface Print {
  id: string;
  url: string;
  titulo: string;
  descricao: string;
  mimeType?: string;
}

/** True when the gallery item is a video (MIME, data URL, or file extension). */
export function isVideoMedia(url: string, mimeType?: string): boolean {
  if (mimeType?.toLowerCase().startsWith("video/")) return true;
  if (url.startsWith("data:video/")) return true;
  const path = url.split("?")[0]?.split("#")[0] ?? "";
  return /\.(mp4|webm|mov|m4v|avi|mkv|ogv)(\?|$)/i.test(path);
}

/** Prints de demonstração da solução (dashboards e sistemas). */
export function galeriaDoCase(caseId: string, nome: string, custom?: Print[]): Print[] {
  if (custom?.length) return custom;

  const offset = [...caseId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return DASHBOARDS.map((img, i) => {
    const src = DASHBOARDS[(offset + i) % DASHBOARDS.length]!;
    return {
      id: `${caseId}-${i + 1}`,
      url: src.url,
      titulo: src.titulo,
      descricao: src.descricao.replace("a solução", nome),
    };
  });
}
