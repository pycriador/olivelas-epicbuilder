import type { Nivel } from "./types";

export interface Integracao {
  id: string;
  nome: string;
  descricao: string;
  paraQue: string;
  nivel: Nivel;
  status: "Ativa" | "Em avaliação" | "Uso restrito";
  categoria: string;
  interna?: boolean;
  quandoUsar: string[];
  quandoNaoUsar: string[];
  exemplos: string[];
  tutoriais: { titulo: string; duracao: string }[];
  casesRelacionados: string[];
  tags: string[];
}

export const integracoes: Integracao[] = [
  {
    id: "slack",
    nome: "Slack",
    descricao:
      "Notificações, resumos e comandos de IA entregues direto nos canais dos times.",
    paraQue: "Levar alertas e resumos gerados por IA para onde o time já conversa.",
    nivel: "Iniciante",
    status: "Ativa",
    categoria: "Comunicação",
    quandoUsar: [
      "Resumo diário ou semanal para um canal",
      "Alertas de urgência detectados por IA",
      "Consultas rápidas via comando de bot",
    ],
    quandoNaoUsar: [
      "Envio de dados sensíveis para canais públicos",
      "Fluxos que exigem trilha de auditoria formal",
    ],
    exemplos: [
      "Resumo semanal de feedback publicado no canal de produto",
      "Alerta quando um ticket é classificado como crítico",
    ],
    tutoriais: [{ titulo: "Publicando resumos no Slack", duracao: "14 min" }],
    casesRelacionados: ["analise-feedback", "triagem-atendimento"],
    tags: ["slack", "notificações", "comunicação", "bot"],
  },
  {
    id: "confluence",
    nome: "Confluence",
    descricao:
      "Indexação da documentação interna para busca semântica e respostas com citação da fonte.",
    paraQue: "Transformar a documentação em base de conhecimento consultável por IA.",
    nivel: "Intermediário",
    status: "Ativa",
    categoria: "Documentação",
    quandoUsar: [
      "Respostas internas que precisam citar a fonte",
      "Busca por significado em páginas antigas",
      "Onboarding de novas pessoas no time",
    ],
    quandoNaoUsar: [
      "Páginas com dados pessoais de clientes",
      "Conteúdo desatualizado sem curadoria",
    ],
    exemplos: [
      "Assistente responde processos internos citando a página",
      "Detecção de documentação duplicada",
    ],
    tutoriais: [{ titulo: "Indexando espaços do Confluence", duracao: "18 min" }],
    casesRelacionados: ["base-conhecimento"],
    tags: ["confluence", "documentação", "busca", "conhecimento"],
  },
  {
    id: "jira",
    nome: "Jira",
    descricao:
      "Criação e enriquecimento automático de issues a partir de análises e classificações de IA.",
    paraQue: "Virar insight em tarefa priorizada sem digitação manual.",
    nivel: "Intermediário",
    status: "Ativa",
    categoria: "Produto & Engenharia",
    quandoUsar: [
      "Abrir issue a partir de feedback classificado",
      "Preencher descrição e labels automaticamente",
      "Agrupar itens por tema recorrente",
    ],
    quandoNaoUsar: [
      "Criação em massa sem revisão humana",
      "Projetos sem dono definido",
    ],
    exemplos: [
      "Bug recorrente identificado no feedback abre issue automaticamente",
      "Resumo de sprint gerado a partir das issues fechadas",
    ],
    tutoriais: [{ titulo: "Do insight à issue no Jira", duracao: "16 min" }],
    casesRelacionados: ["analise-feedback", "qa-testes"],
    tags: ["jira", "issues", "produto", "engenharia"],
  },
  {
    id: "netsuite",
    nome: "NetSuite",
    descricao:
      "Leitura de lançamentos e documentos financeiros para conciliação assistida por IA.",
    paraQue: "Apoiar o fechamento contábil com conciliação e fila de exceções.",
    nivel: "Avançado",
    status: "Uso restrito",
    categoria: "Financeiro",
    quandoUsar: [
      "Conciliação de lançamentos em volume",
      "Identificação de divergências recorrentes",
      "Extração de campos de documentos fiscais",
    ],
    quandoNaoUsar: [
      "Escrita direta em registros contábeis sem aprovação",
      "Decisões fiscais sem validação do time financeiro",
    ],
    exemplos: [
      "Conciliação assistida com fila de exceções",
      "Sugestão de classificação contábil com justificativa",
    ],
    tutoriais: [{ titulo: "Conciliação assistida no NetSuite", duracao: "21 min" }],
    casesRelacionados: ["conciliacao-financeira", "contratos-extracao"],
    tags: ["netsuite", "erp", "financeiro", "conciliação"],
  },
  {
    id: "salesforce",
    nome: "Salesforce",
    descricao:
      "Enriquecimento de leads e priorização de fila com scores gerados por modelos internos.",
    paraQue: "Colocar o próximo melhor contato no topo da fila do consultor.",
    nivel: "Intermediário",
    status: "Ativa",
    categoria: "Comercial",
    quandoUsar: [
      "Priorização de fila de contatos",
      "Resumo do histórico do lead antes da ligação",
      "Sugestão de próximo passo",
    ],
    quandoNaoUsar: [
      "Score sem explicação para o consultor",
      "Atualização automática de campos críticos do CRM",
    ],
    exemplos: [
      "Score de propensão exibido no registro do lead",
      "Resumo automático das últimas interações",
    ],
    tutoriais: [{ titulo: "Scores dentro do CRM", duracao: "17 min" }],
    casesRelacionados: ["scoring-leads", "previsao-demanda"],
    tags: ["salesforce", "crm", "comercial", "leads"],
  },
  {
    id: "zendesk",
    nome: "Zendesk",
    descricao:
      "Triagem automática de tickets por tema, urgência e time responsável.",
    paraQue: "Encurtar o tempo entre o contato do cliente e a pessoa certa.",
    nivel: "Iniciante",
    status: "Ativa",
    categoria: "Atendimento",
    quandoUsar: [
      "Classificação e roteamento de tickets",
      "Sugestão de resposta baseada em documentação",
      "Detecção de temas em alta",
    ],
    quandoNaoUsar: [
      "Resposta enviada ao cliente sem revisão",
      "Casos jurídicos ou sensíveis",
    ],
    exemplos: [
      "Ticket roteado automaticamente para o time correto",
      "Rascunho de resposta com citação da política interna",
    ],
    tutoriais: [{ titulo: "Triagem de tickets com IA", duracao: "15 min" }],
    casesRelacionados: ["triagem-atendimento", "base-conhecimento"],
    tags: ["zendesk", "atendimento", "tickets", "triagem"],
  },
  {
    id: "google-workspace",
    nome: "Google Workspace",
    descricao:
      "Leitura de planilhas e documentos e geração de relatórios automáticos no Drive.",
    paraQue: "Gerar e distribuir relatórios sem trabalho manual de formatação.",
    nivel: "Iniciante",
    status: "Ativa",
    categoria: "Produtividade",
    quandoUsar: [
      "Relatórios recorrentes em Docs ou Sheets",
      "Consolidação de planilhas de times diferentes",
      "Anexos processados automaticamente",
    ],
    quandoNaoUsar: [
      "Planilhas com dado pessoal sem controle de acesso",
      "Cálculos financeiros oficiais sem conferência",
    ],
    exemplos: [
      "Relatório mensal de impacto gerado no Drive",
      "Consolidação de planilhas de pauta de conteúdo",
    ],
    tutoriais: [{ titulo: "Relatórios automáticos no Drive", duracao: "13 min" }],
    casesRelacionados: ["seo-conteudo", "analise-feedback"],
    tags: ["google", "drive", "planilhas", "relatórios"],
  },
  {
    id: "github",
    nome: "GitHub",
    descricao:
      "Revisão assistida de pull requests e sumarização de mudanças para o time.",
    paraQue: "Dar contexto rápido de mudanças e apontar riscos antes do merge.",
    nivel: "Avançado",
    status: "Em avaliação",
    categoria: "Engenharia",
    quandoUsar: [
      "Resumo de PR grande",
      "Checagem de padrões e testes ausentes",
      "Notas de release automáticas",
    ],
    quandoNaoUsar: [
      "Aprovação automática de merge",
      "Repositórios com código sensível sem revisão de segurança",
    ],
    exemplos: [
      "Comentário de revisão com riscos apontados",
      "Changelog gerado a partir dos commits",
    ],
    tutoriais: [{ titulo: "Revisão assistida de PRs", duracao: "19 min" }],
    casesRelacionados: ["revisao-codigo", "qa-testes"],
    tags: ["github", "código", "revisão", "engenharia"],
  },
  {
    id: "metabase",
    nome: "Metabase",
    descricao:
      "Perguntas em linguagem natural sobre indicadores já modelados nos painéis internos.",
    paraQue: "Consultar indicadores sem precisar escrever consulta.",
    nivel: "Intermediário",
    status: "Em avaliação",
    categoria: "Dados",
    quandoUsar: [
      "Consulta rápida a indicador existente",
      "Exploração de série histórica",
      "Resumo de painel para apresentação",
    ],
    quandoNaoUsar: [
      "Números oficiais sem conferência do time de dados",
      "Consulta a dado pessoal identificável",
    ],
    exemplos: [
      "Resumo do painel de demanda por região",
      "Comparação de meses em linguagem natural",
    ],
    tutoriais: [{ titulo: "Perguntas em linguagem natural", duracao: "16 min" }],
    casesRelacionados: ["previsao-demanda", "scoring-leads"],
    tags: ["metabase", "dados", "indicadores", "bi"],
  },
  {
    id: "notion",
    nome: "Notion",
    descricao:
      "Sincronização de templates, prompts e playbooks entre o portal e os espaços dos times.",
    paraQue: "Manter templates e prompts atualizados onde o time trabalha.",
    nivel: "Iniciante",
    status: "Ativa",
    categoria: "Documentação",
    quandoUsar: [
      "Publicar templates aprovados",
      "Manter playbooks versionados",
      "Compartilhar prompts padronizados",
    ],
    quandoNaoUsar: [
      "Fonte única de verdade de dados operacionais",
      "Conteúdo que exige controle de acesso granular",
    ],
    exemplos: [
      "Templates do portal replicados no espaço do time",
      "Prompt padronizado publicado com histórico",
    ],
    tutoriais: [{ titulo: "Sincronizando templates", duracao: "12 min" }],
    casesRelacionados: ["descricao-anuncios", "base-conhecimento"],
    tags: ["notion", "templates", "prompts", "documentação"],
  },
];

export const getIntegracao = (id?: string) => integracoes.find((i) => i.id === id);

/** Integrações usadas por um case (mapeamento determinístico dos dados mockados). */
const porCase: Record<string, string[]> = {
  "analise-feedback": ["Slack", "Jira", "Google Workspace"],
  "triagem-atendimento": ["Zendesk", "Slack", "Confluence"],
  "conciliacao-financeira": ["NetSuite", "Google Workspace"],
  "contratos-extracao": ["NetSuite", "Google Workspace", "Confluence"],
  "scoring-leads": ["Salesforce", "Metabase"],
  "previsao-demanda": ["Metabase", "Salesforce"],
  "base-conhecimento": ["Confluence", "Notion", "Zendesk"],
  "revisao-codigo": ["GitHub", "Slack"],
  "qa-testes": ["GitHub", "Jira"],
  "descricao-anuncios": ["Notion", "Google Workspace"],
  "seo-conteudo": ["Google Workspace", "Notion"],
};

const nomes = integracoes.map((i) => i.nome);

export function integracoesDoCase(caseId: string): string[] {
  const fixo = porCase[caseId];
  if (fixo) return fixo;
  const base = [...caseId].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return [0, 1, 2].map((k) => nomes[(base + k * 3) % nomes.length]!);
}
