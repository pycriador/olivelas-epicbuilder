import { apiBaseUrl } from "@/lib/jira-import";
import type { HubBlock } from "@/data/types";

export type HubInlineVisual = {
  afterHeading: string;
  dataUrl: string;
};

export type HubSectionInput = {
  heading: string;
  content: string;
};

export type HubVisualsMode = "all" | "cover" | "sections";

export type HubVisualsResponse = {
  titulo: string;
  descricao: string;
  capa: string;
  inlineImages: HubInlineVisual[];
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Insert AI infographics after matching section headings. */
export function injectInlineImages(
  blocks: HubBlock[],
  images: HubInlineVisual[],
): HubBlock[] {
  if (!images.length) return blocks;
  const out = [...blocks];
  for (const img of images) {
    if (!img.dataUrl) continue;
    const target = norm(img.afterHeading);
    let idx = out.findIndex(
      (b) => b.type === "heading" && norm(b.title || "") === target,
    );
    if (idx < 0) {
      idx = out.findIndex(
        (b) =>
          b.type === "heading" &&
          (norm(b.title || "").includes(target) ||
            target.includes(norm(b.title || ""))),
      );
    }
    if (idx < 0) continue;
    if (out[idx + 1]?.type === "image") {
      out[idx + 1] = { type: "image", url: img.dataUrl };
      continue;
    }
    out.splice(idx + 1, 0, { type: "image", url: img.dataUrl });
  }
  return out;
}

export async function generateHubVisuals(input: {
  body: string;
  kind: string;
  sections?: HubSectionInput[];
  mode?: HubVisualsMode;
  signal?: AbortSignal;
}): Promise<HubVisualsResponse> {
  const response = await fetch(`${apiBaseUrl()}/api/hub/visuals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      body: input.body,
      kind: input.kind,
      mode: input.mode || "all",
      sections: (input.sections || [])
        .filter((s) => s.heading.trim())
        .map((s) => ({
          heading: s.heading.trim(),
          content: (s.content || "").slice(0, 700),
        })),
    }),
    ...(input.signal ? { signal: input.signal } : {}),
  });
  if (!response.ok) {
    let detail = "Falha ao gerar capa e imagens das seções.";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) detail = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  const data = (await response.json()) as HubVisualsResponse;
  return {
    titulo: data.titulo || "",
    descricao: data.descricao || "",
    capa: data.capa || "",
    inlineImages: (data.inlineImages || []).map((item) => ({
      afterHeading: item.afterHeading,
      dataUrl: item.dataUrl,
    })),
  };
}
