const doresPorCase: Record<string, string[]> = {
  "analise-feedback": [
    "Volume de comentários maior do que o time consegue ler manualmente",
    "Temas críticos descobertos semanas depois de aparecerem",
    "Categorias inconsistentes entre analistas diferentes",
    "Horas de tabulação em planilhas sem valor analítico",
    "Falta de visão consolidada por sentimento e urgência",
  ],
};

const doresPadrao: string[] = [
  "Processo manual e repetitivo consumindo horas do time toda semana",
  "Informação espalhada em planilhas, e-mails e ferramentas diferentes",
  "Retrabalho por falta de padrão claro entre as pessoas envolvidas",
  "Demora para responder demandas urgentes do dia a dia",
  "Dificuldade de medir o resultado e priorizar o que importa",
];

export const doresDoCase = (id: string) => (doresPorCase[id] ?? doresPadrao).slice(0, 5);
