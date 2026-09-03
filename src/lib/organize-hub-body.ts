import type { HubBlock, HubKind } from "@/data/types";
import { HUB_TAG_FILTERS } from "@/data/hub";

const TAG_KEYWORDS: Array<{ tag: string; patterns: RegExp[] }> = [
  { tag: "IA", patterns: [/\bia\b/i, /intelig[eê]ncia artificial/i, /\bgenai\b/i, /generativa/i] },
  { tag: "Automação", patterns: [/automa[cç]/i, /\bn8n\b/i, /workflow/i, /power automate/i] },
  { tag: "Agentes", patterns: [/agente/i, /agentic/i, /copilot studio/i, /agents? sdk/i, /cowork/i] },
  { tag: "n8n", patterns: [/\bn8n\b/i] },
  { tag: "Prompts", patterns: [/prompt/i, /tcrei/i, /few-?shot/i] },
  { tag: "APIs", patterns: [/\bapis?\b/i, /endpoint/i, /sdk/i] },
  { tag: "Dados", patterns: [/\brag\b/i, /embedding/i, /vetorial/i, /knowledge base/i, /\bdados\b/i] },
  { tag: "Produtividade", patterns: [/produtividade/i, /dia a dia/i, /rotina/i, /workspace/i] },
  { tag: "MCP", patterns: [/\bmcp\b/i, /model context protocol/i] },
  { tag: "Gemini", patterns: [/gemini/i, /google ai studio/i, /vertex/i] },
  { tag: "Copilot", patterns: [/copilot/i, /microsoft 365/i, /\boffice\b/i, /excel|powerpoint|word/i] },
  { tag: "Claude", patterns: [/claude/i, /anthropic/i] },
  { tag: "Cursor", patterns: [/\bcursor\b/i] },
  { tag: "OpenAI", patterns: [/openai/i, /chatgpt/i, /\bgpt-?\d/i] },
  { tag: "AWS", patterns: [/\baws\b/i, /bedrock/i] },
  { tag: "Skills", patterns: [/\bskills?\b/i, /habilidades?/i] },
  { tag: "Conceitos", patterns: [/o que [eé]/i, /explica/i, /conceito/i, /fundamento/i, /guia completo/i] },
  { tag: "Governança", patterns: [/governan/i, /lgpd/i, /privacidade/i, /respons[aá]vel/i, /regula/i] },
  { tag: "Tutorial", patterns: [/passo a passo/i, /tutorial/i, /como (criar|montar|fazer|usar)/i] },
  { tag: "AI News", patterns: [/anunci/i, /lan[cç]a/i, /mat[eé]ria/i, /not[ií]cia/i] },
];

/** Contextual cover images — scored by keyword hits in the body. */
const IMAGE_LIBRARY: Array<{ keywords: RegExp[]; url: string }> = [
  {
    keywords: [/claude/i, /anthropic/i, /cowork/i, /projetos?/i],
    url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/excel/i, /planilha/i, /\.xlsx/i, /fechamento/i, /powerpoint/i, /\.pptx/i, /word/i, /\.docx/i],
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/office/i, /microsoft/i, /suplementos?/i, /copilot/i],
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/automa/i, /agente/i, /workflow/i, /schedule/i, /dispatch/i, /tarefas?\s+agendadas?/i],
    url: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/c[oó]digo/i, /\bdev\b/i, /engenharia/i, /\bapis?\b/i, /cursor/i, /program/i],
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/\brag\b/i, /analytics/i, /m[eé]trica/i, /dados/i, /dashboard/i],
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/produtividade/i, /rotina/i, /reuni[aã]o/i, /equipe/i, /\btime\b/i, /e-?mail/i],
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/skills?/i, /habilidades?/i, /artefatos?/i, /landing\s*pages?/i],
    url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/desktop/i, /pasta/i, /arquivo/i, /download/i, /computador/i],
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
  },
  {
    keywords: [/gemini/i, /google/i, /workspace/i],
    url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80",
  },
];

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80",
};

const SECTION_NUMBERED =
  /^(n[ií]vel|parte|etapa|fase|cap[ií]tulo|passo|m[oó]dulo|se[cç][aã]o)\s+\d+\b/i;

const SECTION_NAMED =
  /^(contexto|introdu[cç][aã]o|objetivo|resumo|vis[aã]o geral|passo a passo|como funciona|na pr[aá]tica|resultado|conclus[aã]o|pr[oó]ximos passos|fontes?|onde costuma|onde gera|o que (voc[eê]|vai)|por que|quando usar)\b/i;

const TIP_LABEL =
  /^(dica(?:\s+pr[aá]tica)?(?:\s+\d+)?|atalho(?:\s+de\s+transi[cç][aã]o)?|cuidado|aten[cç][aã]o|importante|aviso|nota|lembrete|hack)\s*[:—-]/i;

const TIP_OR_STEP_HEADING =
  /^(dica|hack|tip|atalho|passo|item)\s*\d+\b/i;

function unique(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    const norm = key.toLocaleLowerCase("pt-BR");
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(key);
  }
  return out;
}

/** Remove markdown markers for clean display text (keeps words). */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/^```\w*\n?/, "").replace(/\n?```$/, ""),
    )
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*•–—]\s+/gm, "")
    .replace(/^\s*\d+[\).]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Inline markdown → React-friendly segments (bold / plain). */
export type RichSegment = { text: string; bold?: boolean; italic?: boolean };

export function parseInlineMarkdown(raw: string): RichSegment[] {
  const text = raw
    .replace(/^#{1,6}\s+/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const segments: RichSegment[] = [];
  const re = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|_(.+?)_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index) });
    }
    if (match[2] || match[3]) {
      segments.push({ text: match[2] || match[3] || "", bold: true });
    } else {
      segments.push({ text: match[4] || match[5] || "", italic: true });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  if (!segments.length) return [{ text }];
  return segments.filter((s) => s.text.length);
}

function isHr(line: string) {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function isMdHeading(line: string) {
  return /^#{1,6}\s+\S/.test(line.trim());
}

function headingFrom(line: string) {
  return stripMarkdown(line.replace(/^#{1,6}\s+/, "").trim());
}

function isListLine(line: string) {
  return /^\s*(?:[-*•–—]|\d+[\).])\s+\S/.test(line);
}

function listText(line: string) {
  return line.trim().replace(/^\s*(?:[-*•–—]|\d+[\).])\s+/, "").trim();
}

function normalizeLine(line: string) {
  return line.trim().replace(/^[-*•–—]\s+/, "").replace(/^#{1,6}\s+/, "");
}

/**
 * Section titles (Nível 1, Parte 2, Contexto…) — NOT topic cards.
 * Must run before feature/list classification.
 */
export function isSectionTitle(line: string): boolean {
  const raw = normalizeLine(line);
  const clean = stripMarkdown(raw).replace(/\s+/g, " ").trim();
  if (!clean || clean.length > 110) return false;

  if (SECTION_NUMBERED.test(clean)) return true;

  if (SECTION_NAMED.test(clean) && clean.length <= 90 && !/[.!?…]/.test(clean)) {
    return true;
  }

  // Whole line is only bold title (optional trailing colon)
  if (/^\*\*[^*]{3,90}\*\*\s*[:—-]?\s*$/.test(raw)) return true;
  if (/^__[^_]{3,90}__\s*[:—-]?\s*$/.test(raw)) return true;

  // Short title + short subtitle after colon, no sentence punctuation
  // e.g. "Nível 1: O Entusiasta" already caught; also "O Intermediário: Claude Cowork"
  if (
    !/[.!?…]/.test(clean) &&
    clean.length <= 70 &&
    /^[A-ZÀ-Ü0-9]/.test(clean) &&
    !TIP_LABEL.test(clean)
  ) {
    const colon = clean.indexOf(":");
    if (colon > 0) {
      const lead = clean.slice(0, colon).trim();
      const rest = clean.slice(colon + 1).trim();
      // Section-like: short lead, short role/name after colon, no long prose
      if (lead.length <= 40 && rest.length > 0 && rest.length <= 45 && rest.split(/\s+/).length <= 8) {
        if (SECTION_NUMBERED.test(lead) || /^(n[ií]vel|parte|etapa|fase)/i.test(lead)) return true;
      }
    }
  }

  // Standalone title lines (common in pasted posts without markdown)
  const words = clean.split(/\s+/).filter(Boolean);
  if (
    !/[.!?…]/.test(clean) &&
    !TIP_LABEL.test(clean) &&
    /^[A-ZÀ-Ü0-9]/.test(clean) &&
    clean.length >= 12 &&
    clean.length <= 100 &&
    words.length >= 3 &&
    words.length <= 16
  ) {
    return true;
  }

  return false;
}

function isCalloutLine(line: string) {
  const t = stripMarkdown(normalizeLine(line));
  return /^(dica(?:\s+pr[aá]tica)?|atalho(?:\s+de\s+transi[cç][aã]o)?|cuidado|aten[cç][aã]o|importante|aviso|nota|fonte|fontes|por que isso importa|lembrete)\s*[:—-]/i.test(
    t,
  );
}

function parseCallout(line: string): HubBlock {
  const clean = stripMarkdown(normalizeLine(line));
  const m = clean.match(
    /^(dica(?:\s+pr[aá]tica)?|cuidado|aten[cç][aã]o|importante|aviso|nota|fonte|fontes|por que isso importa|lembrete|atalho(?:\s+de\s+transi[cç][aã]o)?)\s*[:—-]\s*(.+)$/i,
  );
  const rawLabel = (m?.[1] || "Nota").trim().toLocaleLowerCase("pt-BR");
  const titleMap: Record<string, string> = {
    dica: "Dica",
    "dica prática": "Dica prática",
    "dica pratica": "Dica prática",
    cuidado: "Cuidado",
    atenção: "Atenção",
    atencao: "Atenção",
    importante: "Importante",
    aviso: "Aviso",
    nota: "Nota",
    fonte: "Fonte",
    fontes: "Fontes",
    "por que isso importa": "Por que isso importa",
    lembrete: "Lembrete",
    atalho: "Atalho",
    "atalho de transição": "Atalho de transição",
    "atalho de transicao": "Atalho de transição",
  };
  const title = titleMap[rawLabel] || rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
  const text = (m?.[2] || clean).trim();
  const type =
    /fonte|cuidado|aten|importante|aviso/i.test(title) ? ("callout" as const) : ("tip" as const);
  return { type, title, text };
}

/**
 * Topic cards: "**Memória e Conectores:** longo texto…"
 * Excludes section titles like "**Nível 1: O Entusiasta**".
 */
function isFeatureLine(line: string) {
  if (isSectionTitle(line)) return false;
  const t = normalizeLine(line);
  const clean = stripMarkdown(t);
  // Tip/cuidado lines become balloons, not feature cards — still "feature-shaped"
  if (
    /^\*\*[^*]+\*\*\s*[:—-]/.test(t) ||
    /^[A-ZÀ-Ü][^:]{1,50}:\s+\S/.test(clean)
  ) {
    // Must have meaningful body after the label (topic), not just a short subtitle
    const after = clean.includes(":")
      ? clean.slice(clean.indexOf(":") + 1).trim()
      : "";
    if (after.length >= 25 || after.split(/\s+/).length >= 5) return true;
    // Bold lead with body in markdown form
    const mdBody = t.replace(/^\*\*[^*]+\*\*\s*[:—-]?\s*/, "").trim();
    if (mdBody.length >= 25) return true;
  }
  return false;
}

function toLines(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \u00a0]+/g, " ").trimEnd())
    .map((l) => l.trim());
}

/** Pick a cover image that fits the pasted content (no caption). */
export function pickImageForContent(text: string): { url: string } {
  let bestUrl = DEFAULT_IMAGE.url;
  let bestScore = 0;
  for (const item of IMAGE_LIBRARY) {
    let score = 0;
    for (const re of item.keywords) {
      if (!re.test(text)) continue;
      // Brand / product keywords weigh more than generic nouns
      const weight = /claude|anthropic|gemini|copilot|openai|chatgpt|cursor|cowork/i.test(
        re.source,
      )
        ? 3
        : 1;
      score += weight;
    }
    if (score > bestScore) {
      bestScore = score;
      bestUrl = item.url;
    }
  }
  return { url: bestUrl };
}

/**
 * Turns raw / markdown paste into Hub blocks:
 * section bars, prose, list topic cards, tip/callout balloons.
 * Cover image is returned via pickImageForContent (capa), not as a body block.
 */
export function organizeHubBody(raw: string, kind: HubKind = "post"): HubBlock[] {
  const lines = toLines(raw);
  if (!lines.some((l) => l.trim())) return [];

  const blocks: HubBlock[] = [];
  let listBuf: string[] = [];
  let paraBuf: string[] = [];

  const softClean = (text: string) =>
    text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push({
      type: "list",
      items: listBuf.map((item) => softClean(item)).filter(Boolean),
    });
    listBuf = [];
  };

  const flushPara = () => {
    if (!paraBuf.length) return;
    const text = softClean(paraBuf.join(" "));
    paraBuf = [];
    if (!text) return;
    blocks.push({ type: "paragraph", text });
  };

  const pushHeading = (title: string) => {
    flushPara();
    flushList();
    const clean = stripMarkdown(title);
    if (!clean) return;
    const last = blocks[blocks.length - 1];
    if (last?.type === "heading" && last.title === clean) return;
    blocks.push({ type: "heading", title: clean });
  };

  const pushBalloon = (line: string) => {
    flushPara();
    flushList();
    blocks.push(parseCallout(line));
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (!line) {
      flushPara();
      // Keep list topics grouped across blank lines within the same section
      continue;
    }

    if (isHr(line)) {
      flushPara();
      flushList();
      continue;
    }

    if (isMdHeading(line)) {
      pushHeading(headingFrom(line));
      continue;
    }

    // Section titles (Nível 1, Parte 2…) — even if written as list/bold
    if (isSectionTitle(line)) {
      pushHeading(normalizeLine(line));
      continue;
    }

    // Tip / cuidado / atalho → balloons
    if (isCalloutLine(line)) {
      pushBalloon(line);
      continue;
    }

    // List or feature topic
    if (isListLine(line) || isFeatureLine(line)) {
      const item = isListLine(line) ? listText(line) : normalizeLine(line);

      if (isSectionTitle(item)) {
        pushHeading(item);
        continue;
      }
      if (isCalloutLine(item)) {
        pushBalloon(item);
        continue;
      }

      flushPara();
      listBuf.push(item.replace(/^#{1,6}\s+/, ""));
      continue;
    }

    flushList();
    paraBuf.push(line.replace(/^#{1,6}\s+/, ""));
  }

  flushPara();
  flushList();

  if (!blocks.length) return [];

  // Drop accidental document title duplicated as first heading when it matches meta title length
  // Opening "Contexto" only when content starts mid-prose without any heading
  if (blocks[0]?.type !== "heading") {
    blocks.unshift({
      type: "heading",
      title: kind === "news" ? "A matéria" : kind === "tutorial" ? "Visão geral" : "Contexto",
    });
  }

  // Collapse "Fontes" into a callout only for AI News
  if (kind === "news") {
    const fontesIdx = blocks.findIndex(
      (b) => b.type === "heading" && /fontes?/i.test(b.title || ""),
    );
    if (fontesIdx >= 0) {
      const sourceLines: string[] = [];
      let j = fontesIdx + 1;
      while (j < blocks.length) {
        const b = blocks[j]!;
        if (b.type === "heading") break;
        if (b.type === "paragraph" && b.text) sourceLines.push(b.text);
        if (b.type === "list" && b.items) sourceLines.push(...b.items);
        if (b.type === "tip" || b.type === "callout") {
          if (b.text) sourceLines.push(b.text);
        }
        j += 1;
      }
      if (sourceLines.length) {
        return [
          ...blocks.slice(0, fontesIdx),
          {
            type: "callout" as const,
            title: "Fontes",
            text: sourceLines.map((s) => stripMarkdown(s)).join("\n"),
          },
          ...blocks.slice(j),
        ];
      }
    }
    return blocks;
  }

  // Posts/tutorials: drop Fontes heading/callout (and trailing source lines under that heading)
  const filtered: typeof blocks = [];
  let skippingFontes = false;
  for (const b of blocks) {
    if (b.type === "callout" && /fontes?/i.test(b.title || "")) continue;
    if (b.type === "heading" && /fontes?/i.test(b.title || "")) {
      skippingFontes = true;
      continue;
    }
    if (skippingFontes) {
      if (b.type === "heading") {
        skippingFontes = false;
        filtered.push(b);
      }
      continue;
    }
    filtered.push(b);
  }
  return filtered;
}

/** Infer title + short description from pasted body. Prefer a catchy question. */
export function inferHubMeta(raw: string): { titulo: string; descricao: string } {
  const lines = toLines(raw).filter((l) => l && !isHr(l));

  const topic =
    (/\bnotebooklm\b|\bgemini notebook\b/i.test(raw) && "Gemini Notebook") ||
    (/\bclaude\b/i.test(raw) && "Claude") ||
    (/\bcopilot\b/i.test(raw) && "Copilot") ||
    (/\bgemini\b/i.test(raw) && "Gemini") ||
    (/\bchatgpt|openai\b/i.test(raw) && "ChatGPT") ||
    (/\bcursor\b/i.test(raw) && "Cursor") ||
    (/\bn8n\b/i.test(raw) && "n8n") ||
    "IA";

  const skipAsTitle = (h: string) =>
    SECTION_NUMBERED.test(h) ||
    SECTION_NAMED.test(h) ||
    TIP_LABEL.test(h) ||
    TIP_OR_STEP_HEADING.test(h) ||
    /^https?:/i.test(h) ||
    h.length > 100;

  let titulo = "";

  const nivelNums = [...raw.matchAll(/n[ií]vel\s+(\d+)/gi)].map((m) => Number(m[1]));
  const maxNivel = nivelNums.length ? Math.max(...nivelNums) : 0;
  if (maxNivel >= 2) {
    titulo = `Você já domina os ${maxNivel} níveis de uso do ${topic}?`;
  }

  const renameMatch = raw.match(
    /(?:passou a se chamar|agora se chama|renomead[oa]|rebrand|virou)\s+([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ÿ .-]{2,40})/i,
  );
  if (!titulo && renameMatch?.[1]) {
    const novo = renameMatch[1].replace(/\s+/g, " ").trim();
    titulo = `${topic === "IA" ? "Essa ferramenta" : topic} mudou de nome — o que muda na prática?`;
    if (/notebook/i.test(novo) || /gemini/i.test(novo)) {
      titulo = `NotebookLM virou ${novo} — o que muda pra você?`;
    }
  }

  if (!titulo && /\batualiza[cç][aã]o|novidades?|lan[cç]a/i.test(raw) && topic !== "IA") {
    titulo = `O que há de novo no ${topic} (e o que vale adotar)?`;
  }

  let bestHeading = "";
  let bestLevel = 99;
  for (const line of lines) {
    if (!isMdHeading(line)) continue;
    const level = (line.match(/^#{1,6}/)?.[0] || "######").length;
    const h = headingFrom(line);
    if (h.length < 8 || skipAsTitle(h)) continue;
    if (level < bestLevel) {
      bestHeading = h;
      bestLevel = level;
      if (level <= 2) break;
    }
  }

  if (!titulo && bestHeading) {
    const clean = bestHeading.replace(/[.!]$/, "").trim();
    if (clean.includes("?")) {
      titulo = clean;
    } else if (/^como\b/i.test(clean)) {
      titulo = `${clean}?`;
    } else if (topic !== "IA" && clean.toLowerCase().includes(topic.toLowerCase())) {
      titulo = `Você já aplica isso no ${topic}?`;
      if (clean.length <= 72) titulo = `${clean}?`;
    } else if (clean.length <= 72) {
      titulo = `${clean}?`;
    } else {
      titulo = `Vale a pena ler sobre ${topic} agora?`;
    }
  }

  if (!titulo) {
    for (const line of lines) {
      if (isListLine(line) || isCalloutLine(line) || isSectionTitle(line)) continue;
      const clean = stripMarkdown(line);
      if (clean.length < 12 || clean.length > 80 || /^https?:/i.test(clean)) continue;
      if (skipAsTitle(clean) || /[.!?…]/.test(clean)) continue;
      titulo = /^como\b/i.test(clean) ? `${clean}?` : `Como tirar mais do ${topic}?`;
      break;
    }
  }

  if (!titulo) {
    for (const line of lines.slice(0, 16)) {
      const m = line.match(/^\*\*([^*]{8,90})\*\*/);
      if (!m?.[1]) continue;
      if (skipAsTitle(m[1]) || TIP_LABEL.test(m[1])) continue;
      const rest = line.replace(/^\*\*[^*]+\*\*\s*[:—-]?\s*/, "").trim();
      if (rest.length > 40) continue;
      const lead = m[1].replace(/[:.]$/, "").trim();
      titulo = lead.includes("?") ? lead : `${lead}?`;
      break;
    }
  }

  if (!titulo) {
    titulo =
      topic === "IA"
        ? "O que este guia muda na sua rotina com IA?"
        : `O que muda no seu dia a dia com ${topic}?`;
  }

  if (titulo && !titulo.trim().endsWith("?")) {
    titulo = `${titulo.replace(/[.!]+$/, "").trim()}?`;
  }
  // Keep titles card-friendly
  if (titulo.length > 96) {
    titulo =
      topic === "IA"
        ? "Vale a pena aplicar este guia no seu time?"
        : `O que vale adotar no ${topic} agora?`;
  }

  const fluffStart =
    /^(ol[aá]|oi[,!]|neste (artigo|texto|post)|hoje (eu|vamos)|vamos falar|introdu[cç][aã]o)\b/i;

  const paraBits: string[] = [];
  for (const line of lines) {
    if (
      isMdHeading(line) ||
      isListLine(line) ||
      isCalloutLine(line) ||
      isFeatureLine(line) ||
      isSectionTitle(line)
    ) {
      continue;
    }
    const clean = stripMarkdown(line);
    if (!clean || clean === titulo || fluffStart.test(clean)) continue;
    if (skipAsTitle(clean) && clean.length < 40) continue;
    paraBits.push(clean);
    if (paraBits.join(" ").length >= 200) break;
  }

  let descricao = paraBits.join(" ").replace(/\s+/g, " ").trim();
  if (!descricao) {
    for (const line of lines) {
      if (!(isListLine(line) || isFeatureLine(line))) continue;
      const clean = stripMarkdown(isListLine(line) ? listText(line) : line);
      if (!clean || clean === titulo || isSectionTitle(line)) continue;
      paraBits.push(clean);
      if (paraBits.join(" ").length >= 160) break;
    }
    descricao = paraBits.join(" ").replace(/\s+/g, " ").trim();
  }

  // Prefer 1 clear sentence for cards
  const sentences = descricao.match(/[^.!?]+[.!?]+/g) ?? [];
  if (sentences.length >= 1) {
    const first = sentences[0]!.trim();
    const two = sentences
      .slice(0, 2)
      .join(" ")
      .trim();
    descricao = two.length <= 160 ? two : first.length <= 160 ? first : first;
  }

  if (descricao.length > 160) {
    descricao = descricao.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  }

  // If still too "raw" (very long first dump), fall back to benefit line
  if (!descricao || descricao.length < 28) {
    descricao =
      topic === "IA"
        ? "Resumo prático do que importa aplicar no trabalho — sem enrolação."
        : `Resumo prático sobre ${topic}: o que mudou e o que vale adotar no trabalho.`;
  }

  return {
    titulo: titulo.slice(0, 120),
    descricao: descricao.slice(0, 180),
  };
}

export function suggestHubTags(input: {
  titulo?: string;
  descricao?: string;
  body?: string;
  kind?: HubKind;
  catalogTags?: string[];
}): string[] {
  const blob = [input.titulo, input.descricao, input.body].filter(Boolean).join("\n");
  if (!blob.trim()) {
    if (input.kind === "news") return ["AI News"];
    if (input.kind === "tutorial") return ["Tutorial"];
    return [];
  }

  const found: string[] = [];
  for (const { tag, patterns } of TAG_KEYWORDS) {
    if (patterns.some((re) => re.test(blob))) found.push(tag);
  }

  if (input.kind === "news" && !found.includes("AI News")) found.unshift("AI News");
  if (input.kind === "tutorial" && !found.includes("Tutorial")) found.push("Tutorial");
  if (input.kind === "video" && !found.includes("Tutorial")) found.push("Tutorial");

  for (const tag of input.catalogTags ?? []) {
    if (!tag || tag === "Todos") continue;
    const re = new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(blob)) found.push(tag);
  }

  for (const tag of HUB_TAG_FILTERS) {
    if (tag === "Todos") continue;
    const re = new RegExp(`\\b${tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(blob)) found.push(tag);
  }

  return unique(found).slice(0, 8);
}

export function collectKnownHubTags(catalogTags: string[] = []) {
  return unique([
    ...HUB_TAG_FILTERS.filter((t) => t !== "Todos"),
    "OpenAI",
    "AWS",
    "Anthropic",
    "Microsoft",
    "Google",
    "Governança",
    "Tutorial",
    "AI News",
    "RAG",
    "Skills",
    ...catalogTags,
  ]).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function blocksToPlainText(blocks: HubBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "heading") return `## ${b.title || ""}`;
      if (b.type === "paragraph") return b.text || "";
      if (b.type === "list") return (b.items ?? []).map((i) => `- ${i}`).join("\n");
      if (b.type === "tip" || b.type === "callout") return `${b.title || "Nota"}: ${b.text || ""}`;
      if (b.type === "code") return b.text || "";
      if (b.type === "image") return "";
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Sections used for per-heading AI images — mirrors what the preview renders. */
export function extractHubSectionsFromBlocks(
  blocks: HubBlock[],
): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = [];
  let heading = "";
  let bits: string[] = [];

  const flush = () => {
    if (!heading) return;
    if (/^fontes?$/i.test(heading.trim())) {
      heading = "";
      bits = [];
      return;
    }
    sections.push({
      heading,
      content: bits.join(" ").replace(/\s+/g, " ").trim(),
    });
    heading = "";
    bits = [];
  };

  for (const block of blocks) {
    if (block.type === "heading") {
      flush();
      heading = (block.title || "").trim();
      continue;
    }
    if (!heading) continue;
    if (block.type === "paragraph" && block.text) bits.push(block.text);
    if (block.type === "list" && block.items?.length) bits.push(block.items.join(" "));
    if ((block.type === "tip" || block.type === "callout") && block.text) {
      bits.push(`${block.title || ""}: ${block.text}`);
    }
  }
  flush();
  return sections;
}
