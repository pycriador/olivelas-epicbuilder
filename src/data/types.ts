export type Status = "Em produção" | "Piloto" | "Em desenvolvimento" | "Experimento";
export type Impacto = "Alto" | "Médio" | "Baixo";
export type Nivel = "Iniciante" | "Intermediário" | "Avançado";
export type Area =
  | "Produto"
  | "Engenharia"
  | "Comercial"
  | "Operações"
  | "Marketing"
  | "Financeiro";

export interface Metrica {
  label: string;
  valor: string;
  detalhe?: string;
}

export interface Etapa {
  titulo: string;
  texto: string;
  prompt?: string;
  exemplo?: string;
  dica?: string;
}

/** Pessoa responsável pelo épico no Jira. */
export interface Responsavel {
  nome: string;
  avatarUrl?: string;
  email?: string;
}

export interface CaseItem {
  id: string;
  nome: string;
  descricao: string;
  area: string;
  ferramentas: string[];
  impacto: Impacto;
  status: Status;
  time: string;
  responsaveis: string[];
  /** Responsável do épico no Jira (nome + foto). */
  responsavel?: Responsavel;
  /** Status literal do épico no Jira (ex.: "Concluído"). */
  jiraStatus?: string;
  acessos: number;
  novo?: boolean;
  destaque?: boolean;
  cor: string;
  problema: string;
  solucao: string;
  /** Status report: fase em execução hoje. */
  etapaAtual?: string;
  /** Status report: leitura objetiva do andamento. */
  statusAtual?: string;
  /** Status report: próximos passos planejados. */
  etapaSeguinte?: string;

  antes: string[];
  depois: string[];
  fluxo: string[];
  etapas: Etapa[];
  resultados: Metrica[];
  aprendizados: string[];
  aulasRelacionadas: string[];
  templatesRelacionados: string[];
  ferramentasRelacionadas: string[];
  casesRelacionados: string[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Aula {
  id: string;
  trilhaId: string;
  titulo: string;
  duracao: string;
  descricao: string;
  resumo: string;
  aprendizados: string[];
  materiais: { titulo: string; tipo: string }[];
  concluida: boolean;
  tags: string[];
  videoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  nivel: Nivel;
  duracao: string;
  progresso: number;
  cor: string;
  tags: string[];
}

export interface Ferramenta {
  id: string;
  nome: string;
  descricao: string;
  paraQue: string;
  categoria: string;
  nivel: Nivel;
  status: "Aprovada" | "Em avaliação" | "Uso restrito";
  interna?: boolean;
  popular?: boolean;
  quandoUsar: string[];
  quandoNaoUsar: string[];
  exemplos: string[];
  tutoriais: { titulo: string; duracao: string }[];
  casesRelacionados: string[];
  tags: string[];
}

export interface Template {
  id: string;
  nome: string;
  descricao: string;
  tipo: "Automação" | "Agente" | "Análise" | "Workflow";
  ferramentas: string[];
  dificuldade: Nivel;
  tempo: string;
  passos: string[];
  tags: string[];
}

export interface Prompt {
  id: string;
  titulo: string;
  categoria: string;
  prompt: string;
  exemplo: string;
  tags: string[];
}

/** AI Hub content kinds — replaces Academy aulas/trilhas. */
export type HubKind = "tutorial" | "post" | "news" | "video";

export type HubBlockType =
  | "paragraph"
  | "heading"
  | "image"
  | "video"
  | "code"
  | "tip"
  | "list"
  | "callout";

export interface HubBlock {
  type: HubBlockType;
  title?: string;
  text?: string;
  items?: string[];
  url?: string;
  language?: string;
  caption?: string;
}

export interface HubContent {
  id: string;
  kind: HubKind;
  titulo: string;
  descricao: string;
  /** Cover image URL; falls back to solid `cor` when empty. */
  capa?: string;
  cor: string;
  tags: string[];
  dificuldade?: Nivel;
  duracao?: string;
  destaque?: boolean;
  /** News: why this matters for Loft teams. */
  whyItMatters?: string;
  fonte?: string;
  videoUrl?: string;
  /** Video cards that deep-link into a tutorial page. */
  tutorialId?: string;
  blocks: HubBlock[];
  relacionados?: string[];
  createdAt?: string;
  updatedAt?: string;
}
