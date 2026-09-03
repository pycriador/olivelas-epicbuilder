export * from "./types";
export { cases } from "./cases";
export { trilhas, aulas } from "./academy";
export { hubContents, HUB_TAG_FILTERS, getHubContent, hubByKind } from "./hub";
export { ferramentas } from "./ferramentas";
export { templates, prompts } from "./biblioteca";
export { metricasGerais, areas, evolucaoMensal } from "./impacto";

import { cases } from "./cases";
import { trilhas, aulas } from "./academy";
import { hubContents } from "./hub";
import { ferramentas } from "./ferramentas";
import { templates, prompts } from "./biblioteca";

export const getCase = (id?: string) => cases.find((c) => c.id === id);
export const getAula = (id?: string) => aulas.find((a) => a.id === id);
export const getHub = (id?: string) => hubContents.find((h) => h.id === id);
export const getTrilha = (id?: string) => trilhas.find((t) => t.id === id);
export const getFerramenta = (id?: string) => ferramentas.find((f) => f.id === id);
export const getTemplate = (id?: string) => templates.find((t) => t.id === id);
export const getPrompt = (id?: string) => prompts.find((p) => p.id === id);
export const aulasDaTrilha = (trilhaId: string) => aulas.filter((a) => a.trilhaId === trilhaId);
export const casesDaArea = (area: string) => cases.filter((c) => c.area === area);
export const ferramentaPorNome = (nome: string) =>
  ferramentas.find((f) => f.nome.toLowerCase() === nome.toLowerCase());
