import type { Area } from "./types";

export const metricasGerais = [
  { label: "soluções de IA", valor: "48", numero: 48 },
  { label: "horas economizadas por ano", valor: "18.420h", numero: 18420 },
  { label: "pessoas impactadas", valor: "1.247", numero: 1247 },
  { label: "times utilizando IA", valor: "23", numero: 23 },
];

export interface AreaInfo {
  nome: Area;
  descricao: string;
  projetos: number;
  horas: number;
  times: number;
  cor: string;
}

export const areas: AreaInfo[] = [
  {
    nome: "Produto",
    descricao: "Discovery, análise de feedback e apoio à decisão de roadmap.",
    projetos: 11,
    horas: 3820,
    times: 5,
    cor: "#115644",
  },
  {
    nome: "Engenharia",
    descricao: "Revisão de código, busca interna e apoio ao ciclo de desenvolvimento.",
    projetos: 12,
    horas: 4310,
    times: 6,
    cor: "#25302c",
  },
  {
    nome: "Comercial",
    descricao: "Priorização de fila, previsão de demanda e apoio ao consultor.",
    projetos: 8,
    horas: 3560,
    times: 4,
    cor: "#ff774a",
  },
  {
    nome: "Operações",
    descricao: "Triagem, extração de documentos e automação de processos internos.",
    projetos: 9,
    horas: 4120,
    times: 4,
    cor: "#d94616",
  },
  {
    nome: "Marketing",
    descricao: "Conteúdo assistido, planejamento de pauta e padronização de tom.",
    projetos: 5,
    horas: 1480,
    times: 2,
    cor: "#cee79e",
  },
  {
    nome: "Financeiro",
    descricao: "Conciliação assistida e apoio ao fechamento contábil.",
    projetos: 3,
    horas: 2100,
    times: 2,
    cor: "#115644",
  },
];

export const evolucaoMensal = [
  { mes: "Jan", solucoes: 12, horas: 620 },
  { mes: "Fev", solucoes: 16, horas: 810 },
  { mes: "Mar", solucoes: 21, horas: 1040 },
  { mes: "Abr", solucoes: 26, horas: 1180 },
  { mes: "Mai", solucoes: 31, horas: 1390 },
  { mes: "Jun", solucoes: 35, horas: 1520 },
  { mes: "Jul", solucoes: 39, horas: 1685 },
  { mes: "Ago", solucoes: 48, horas: 1840 },
];

