import chatgptLogo from "@/assets/logos/chatgpt.svg";
import lovableLogo from "@/assets/logos/lovable.png.asset.json";
import n8nLogo from "@/assets/logos/n8n.png.asset.json";
import loftLogo from "@/assets/loft-logo.png";
import slackLogo from "@/assets/logos/slack.svg";
import confluenceLogo from "@/assets/logos/confluence.svg";
import jiraLogo from "@/assets/logos/jira.svg";
import netsuiteLogo from "@/assets/logos/netsuite.svg";
import salesforceLogo from "@/assets/logos/salesforce.svg";
import zendeskLogo from "@/assets/logos/zendesk.svg";
import googleLogo from "@/assets/logos/google.svg";
import metabaseLogo from "@/assets/logos/metabase.svg";
import notionLogo from "@/assets/logos/notion.svg";
import githubLogo from "@/assets/logos/github.svg";
import { getCustomIntegracaoLogos } from "@/lib/content-store";

/** Official logo for each tool (internal tools use the Loft brand). */
export const ferramentaLogos: Record<string, string> = {
  chatgpt: chatgptLogo,
  n8n: n8nLogo.url,
  lovable: lovableLogo.url,
  "loft-copilot": loftLogo,
  "loft-studio": loftLogo,
  "loft-insights": loftLogo,
  "loft-guard": loftLogo,
  "apis-de-ia": chatgptLogo,
  "apis-ia": chatgptLogo,
};

/** Official logo for each integrated system. */
export const integracaoLogos: Record<string, string> = {
  slack: slackLogo,
  confluence: confluenceLogo,
  jira: jiraLogo,
  netsuite: netsuiteLogo,
  salesforce: salesforceLogo,
  zendesk: zendeskLogo,
  "google-workspace": googleLogo,
  github: githubLogo,
  metabase: metabaseLogo,
  notion: notionLogo,
};

function slugifyNome(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ALIASES: Record<string, string> = {
  chatgpt: "chatgpt",
  "chat-gpt": "chatgpt",
  openai: "chatgpt",
  n8n: "n8n",
  lovable: "lovable",
  "loft-copilot": "loft-copilot",
  "loft-studio": "loft-studio",
  "loft-insights": "loft-insights",
  "loft-guard": "loft-guard",
  "olivelas-copilot": "loft-copilot",
  "olivelas-studio": "loft-studio",
  "olivelas-insights": "loft-insights",
  "olivelas-guard": "loft-guard",
  "apis-de-ia": "apis-de-ia",
  "api-de-ia": "apis-de-ia",
  "apis-ia": "apis-de-ia",
  google: "google-workspace",
  "google-workspace": "google-workspace",
  gmail: "google-workspace",
};

function lookupStatic(slug: string): string | undefined {
  const key = ALIASES[slug] ?? slug;
  return ferramentaLogos[key] ?? integracaoLogos[key] ?? ferramentaLogos[slug] ?? integracaoLogos[slug];
}

/** Finds logo from id or displayed name (tools + systems + custom uploads). */
export function integracaoLogoPorNome(nome: string): string | undefined {
  const slug = slugifyNome(nome);
  const custom = getCustomIntegracaoLogos();
  return custom[slug] ?? custom[nome] ?? lookupStatic(slug);
}

export function logoDaIntegracao(id: string, nome?: string): string | undefined {
  const custom = getCustomIntegracaoLogos();
  if (custom[id]) return custom[id];
  const fromId = lookupStatic(slugifyNome(id));
  if (fromId) return fromId;
  if (nome) return integracaoLogoPorNome(nome);
  return undefined;
}
