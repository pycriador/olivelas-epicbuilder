import {
  AimOutlined,
  ApiOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  BulbOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LineChartOutlined,
  PictureOutlined,
  RocketOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Space } from "antd";
import { useState, type ComponentType, type ReactNode } from "react";

import { StatusBadge } from "@/components/portal/CaseCard";
import { GaleriaLightbox } from "@/components/portal/GaleriaLightbox";
import { LoftMark } from "@/components/portal/LoftMark";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import type { Print } from "@/data/galeria";
import { isVideoMedia } from "@/data/galeria";
import { integracaoLogoPorNome, logoDaIntegracao } from "@/data/logos";
import type { Impacto, Responsavel, Status } from "@/data/types";
import { getCachedContent } from "@/lib/content-store";
import { formatGaleriaOrigem } from "@/lib/galeria-origem";
import { resolveApiAssetUrl } from "@/lib/jira-import";
import { contrastOnBackground } from "@/lib/utils";

export type IntegrationCitation = {
  issueKey: string;
  issueType: string;
  issueSummary: string;
  field: string;
  quote: string;
};

export type IntegrationDetection = {
  nome: string;
  motivo: string;
  status?: "pending" | "confirmed" | "rejected";
  citations: IntegrationCitation[];
};

export type GaleriaOrigem = {
  issueKey: string;
  issueType: string;
  issueSummary: string;
};

export type GaleriaItem = {
  titulo: string;
  descricao: string;
  url: string;
  mimeType?: string;
  origem?: GaleriaOrigem;
};

export type CaseDraft = {
  nome: string;
  descricao: string;
  area: string;
  status: Status;
  impacto: Impacto;
  cor: string;
  problema: string;
  dores: string[];
  solucao: string;
  etapaAtual: string;
  statusAtual: string;
  etapaSeguinte: string;
  antes: string[];
  depois: string[];
  resultados: { label: string; valor: string; detalhe: string }[];
  galeria: GaleriaItem[];
  /** When true, form shows Jira gallery summary instead of raw fields. */
  galeriaImportada?: boolean;
  /** Epic key from Jira import — used to label “Diretas no épico …”. */
  jiraEpicKey?: string;
  integracoesSelecionadas: string[];
  integracoesDetectadas: IntegrationDetection[];
  semIntegracoes: boolean;
  semMetricas: boolean;
  /** Responsável do épico no Jira (nome + foto). */
  responsavel?: Responsavel;
  /** Status literal do épico no Jira. */
  jiraStatus?: string;
};

function Section({
  title,
  icon: Icone,
  count,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
          <Icone className="text-sm text-primary" />
        </span>
        <h3 className="text-base font-semibold">
          {title}
          {typeof count === "number" ? (
            <span className="ml-1.5 font-normal text-muted-foreground">({count})</span>
          ) : null}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function CaseLivePreview({
  draft,
  onGaleriaChange,
}: {
  draft: CaseDraft;
  onGaleriaChange?: (galeria: GaleriaItem[]) => void;
}) {
  const dores = draft.dores.filter(Boolean);
  const antes = draft.antes.filter(Boolean);
  const depois = draft.depois.filter(Boolean);
  const resultados = draft.resultados.filter((r) => r.label || r.valor);
  const galeria = draft.galeria.filter((g) => g.url.trim());
  const integ = draft.semIntegracoes ? [] : draft.integracoesSelecionadas;
  const showIntegracoes = !draft.semIntegracoes && integ.length > 0;
  const showResultados = !draft.semMetricas && resultados.length > 0;
  const [abertoIndex, setAbertoIndex] = useState<number | null>(null);

  const updateGaleriaItem = (indexInFull: number, patch: Partial<GaleriaItem>) => {
    if (!onGaleriaChange) return;
    const next = draft.galeria.map((item, i) =>
      i === indexInFull ? { ...item, ...patch } : item,
    );
    onGaleriaChange(next);
  };

  const removeGaleriaItem = (indexInFull: number) => {
    if (!onGaleriaChange) return;
    const next = draft.galeria.filter((_, i) => i !== indexInFull);
    onGaleriaChange(next.length ? next : [{ titulo: "", descricao: "", url: "" }]);
    setAbertoIndex(null);
  };

  const moveGaleriaItem = (indexInFull: number, direction: -1 | 1) => {
    if (!onGaleriaChange) return;
    const withUrl = draft.galeria
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.url.trim());
    const visibleIndex = withUrl.findIndex(({ index }) => index === indexInFull);
    if (visibleIndex < 0) return;
    const swapVisible = visibleIndex + direction;
    if (swapVisible < 0 || swapVisible >= withUrl.length) return;
    const from = withUrl[visibleIndex]!.index;
    const to = withUrl[swapVisible]!.index;
    const next = [...draft.galeria];
    const tmp = next[from]!;
    next[from] = next[to]!;
    next[to] = tmp;
    onGaleriaChange(next);
    if (abertoIndex === visibleIndex) setAbertoIndex(swapVisible);
    else if (abertoIndex === swapVisible) setAbertoIndex(visibleIndex);
  };

  const fullIndexForVisible = (visibleIndex: number) => {
    let seen = -1;
    for (let i = 0; i < draft.galeria.length; i++) {
      if (!draft.galeria[i]?.url.trim()) continue;
      seen += 1;
      if (seen === visibleIndex) return i;
    }
    return -1;
  };

  const lightboxPrint: Print | null =
    abertoIndex !== null && galeria[abertoIndex]
      ? {
          id: `preview-${abertoIndex}`,
          url: galeria[abertoIndex]!.url,
          titulo: galeria[abertoIndex]!.titulo,
          descricao: "",
          ...(galeria[abertoIndex]!.mimeType
            ? { mimeType: galeria[abertoIndex]!.mimeType }
            : {}),
        }
      : null;

  const tone = contrastOnBackground(draft.cor || "#115644");

  return (
    <div className="pb-8">
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ backgroundColor: draft.cor || "#115644", color: tone.text }}
      >
        <LoftMark
          backgroundColor={draft.cor || "#115644"}
          alt=""
          className="mb-4 h-8 opacity-95"
        />
        <span
          className="inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
          style={{
            borderColor: tone.chipBorder,
            backgroundColor: tone.chipBg,
            color: tone.muted,
          }}
        >
          {draft.area || "Área"}
        </span>
        <h2 className="mt-3 text-2xl font-semibold leading-tight">
          {draft.nome || "Nome do case"}
        </h2>
        <p className="mt-2 text-sm" style={{ color: tone.muted }}>
          {draft.descricao || "A descrição curta aparece aqui."}
        </p>
        {draft.responsavel?.nome ? (
          <div className="mt-4 flex items-center gap-2.5">
            <ResponsavelAvatar
              nome={draft.responsavel.nome}
              avatarUrl={draft.responsavel.avatarUrl}
              className="h-10 w-10"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {draft.responsavel.nome}
              </span>
              {draft.responsavel.email ? (
                <span className="block truncate text-xs" style={{ color: tone.muted }}>
                  {draft.responsavel.email}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>


      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0">
          <Card className="bg-secondary/40 shadow-card" classNames={{ body: "p-4" }}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Área
            </p>
            <p className="mt-1 font-semibold">{draft.area || "—"}</p>
          </Card>

          <Section title="Problema" icon={AimOutlined}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {draft.problema || "Descreva o problema nesta seção."}
            </p>
          </Section>

          <Section title="Principais dores" icon={WarningOutlined}>
            <Card className="shadow-card" classNames={{ body: "p-4" }}>
              <ul className="space-y-2">
                {(dores.length ? dores : ["As dores aparecerão aqui."]).map((d) => (
                  <li key={d} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </Card>
          </Section>

          <Section title="Solução" icon={BulbOutlined}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {draft.solucao || "Descreva a solução nesta seção."}
            </p>
          </Section>

          <Section title="Etapa atual" icon={RocketOutlined}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {draft.etapaAtual?.trim() || "Descreva a etapa atual nesta seção."}
            </p>
          </Section>

          <Section title="Status atual" icon={LineChartOutlined}>
            <Card className="shadow-card" classNames={{ body: "p-4" }}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {draft.statusAtual?.trim() || "O status atual aparecerá aqui."}
              </p>
            </Card>
          </Section>

          <Section title="Etapa seguinte" icon={ArrowRightOutlined}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {draft.etapaSeguinte?.trim() || "Descreva a próxima etapa nesta seção."}
            </p>
          </Section>

          {showIntegracoes && (
            <Section title="Integrações" icon={ApiOutlined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {integ.map((nome) => {
                  const detalhe = getCachedContent().integracoes.find((i) => i.nome === nome);
                  const logo =
                    (detalhe ? logoDaIntegracao(detalhe.id, detalhe.nome) : undefined) ??
                    logoDaIntegracao(nome) ??
                    integracaoLogoPorNome(nome);
                  return (
                    <Card key={nome} className="shadow-card" classNames={{ body: "flex gap-3 p-3" }}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-card p-1.5">
                        {logo ? (
                          <img src={logo} alt="" className="h-5 w-5 object-contain" />
                        ) : (
                          <ApiOutlined className="text-base text-primary" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{nome}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {detalhe?.descricao ?? "Integração do case"}
                        </span>
                      </span>
                    </Card>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Antes x Depois" icon={SwapOutlined}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-card" classNames={{ body: "p-3" }}>
                <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Antes</p>
                <ul className="space-y-1.5">
                  {(antes.length ? antes : ["Item anterior"]).map((a) => (
                    <li key={a} className="flex gap-2 text-xs text-muted-foreground">
                      <CloseOutlined className="mt-0.5 shrink-0 text-destructive/70" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-accent/30 bg-accent/5 shadow-card" classNames={{ body: "p-3" }}>
                <p className="mb-2 font-mono text-[10px] uppercase text-accent">Depois</p>
                <ul className="space-y-1.5">
                  {(depois.length ? depois : ["Item atual"]).map((d) => (
                    <li key={d} className="flex gap-2 text-xs">
                      <CheckOutlined className="mt-0.5 shrink-0 text-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Section>

          {showResultados && (
            <Section title="Resultados" icon={BarChartOutlined}>
              <div className="grid gap-3 sm:grid-cols-2">
                {resultados.map((r, i) => (
                  <Card
                    key={`${r.label}-${i}`}
                    className="shadow-card"
                    classNames={{ body: "flex flex-col p-3.5" }}
                  >
                    <p className="font-display text-xl font-semibold tracking-tight">
                      {r.valor || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.label || "Rótulo"}</p>
                    {r.detalhe?.trim() ? (
                      <p className="mt-2.5 border-t border-border/70 pt-2.5 text-xs leading-relaxed text-foreground/80">
                        {r.detalhe}
                      </p>
                    ) : null}
                  </Card>
                ))}
              </div>
            </Section>
          )}

          <Section title="Galeria" icon={PictureOutlined} count={galeria.length}>
            {galeria.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {galeria.map((g, i) => {
                  const fullIndex = fullIndexForVisible(i);
                  const origemTexto = formatGaleriaOrigem(g.origem, draft.jiraEpicKey);
                  const mediaUrl = resolveApiAssetUrl(g.url);
                  return (
                    <Card
                      key={`${g.url.slice(0, 48)}-${i}`}
                      className="overflow-hidden shadow-card"
                      styles={{ body: { padding: 0 } }}
                    >
                      <button
                        type="button"
                        onClick={() => setAbertoIndex(i)}
                        className="block aspect-[16/10] w-full cursor-pointer bg-secondary text-left"
                        aria-label={`Ampliar ${g.titulo || `item ${i + 1}`}`}
                      >
                        {isVideoMedia(mediaUrl, g.mimeType) ? (
                          <video
                            src={mediaUrl}
                            muted
                            playsInline
                            preload="metadata"
                            className="pointer-events-none h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt=""
                            className="pointer-events-none h-full w-full object-cover"
                          />
                        )}
                      </button>
                      <div className="space-y-2 p-3">
                        {onGaleriaChange ? (
                          <>
                            <textarea
                              value={g.titulo}
                              onChange={(e) =>
                                updateGaleriaItem(fullIndex, { titulo: e.target.value })
                              }
                              placeholder="Nome da imagem"
                              rows={2}
                              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium leading-snug break-words outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {origemTexto ? (
                              <p className="text-xs leading-relaxed text-muted-foreground break-words">
                                {origemTexto}
                              </p>
                            ) : null}
                            <Space wrap size="small">
                              <Button
                                type="default"
                                size="small"
                                icon={<ArrowUpOutlined />}
                                disabled={i === 0}
                                onClick={() => moveGaleriaItem(fullIndex, -1)}
                                aria-label="Mover para cima"
                              />
                              <Button
                                type="default"
                                size="small"
                                icon={<ArrowDownOutlined />}
                                disabled={i === galeria.length - 1}
                                onClick={() => moveGaleriaItem(fullIndex, 1)}
                                aria-label="Mover para baixo"
                              />
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeGaleriaItem(fullIndex)}
                              >
                                Excluir
                              </Button>
                            </Space>
                          </>
                        ) : (
                          <>
                            {g.titulo ? (
                              <p className="text-sm font-semibold break-words">{g.titulo}</p>
                            ) : null}
                            {origemTexto ? (
                              <p className="text-xs leading-relaxed text-muted-foreground break-words">
                                {origemTexto}
                              </p>
                            ) : null}
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma mídia na galeria.</p>
            )}
          </Section>
        </div>

        <aside>
          <Card className="shadow-card lg:sticky lg:top-4" classNames={{ body: "space-y-3 p-4" }}>
            {draft.responsavel?.nome ? (
              <>
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase text-muted-foreground">
                    Responsável
                  </p>
                  <div className="flex items-center gap-2">
                    <ResponsavelAvatar
                      nome={draft.responsavel.nome}
                      avatarUrl={draft.responsavel.avatarUrl}
                      className="h-9 w-9"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {draft.responsavel.nome}
                      </span>
                      {draft.responsavel.email ? (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {draft.responsavel.email}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
                <Divider className="!my-0" />
              </>
            ) : null}
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase text-muted-foreground">Status</p>
              <StatusBadge status={draft.status} />
            </div>

            <Divider className="!my-0" />
            <div>
              <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Área</p>
              <p className="text-sm">{draft.area || "—"}</p>
            </div>
            {showIntegracoes && (
              <>
                <Divider className="!my-0" />
                <div>
                  <p className="mb-1.5 font-mono text-[10px] uppercase text-muted-foreground">
                    Integrações
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {integ.map((f) => {
                      const detalhe = getCachedContent().integracoes.find((i) => i.nome === f);
                      const logo =
                        (detalhe ? logoDaIntegracao(detalhe.id, detalhe.nome) : undefined) ??
                        logoDaIntegracao(f) ??
                        integracaoLogoPorNome(f);
                      return (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-[11px]"
                        >
                          {logo ? (
                            <img
                              src={logo}
                              alt=""
                              aria-hidden
                              className="h-3.5 w-3.5 shrink-0 object-contain"
                            />
                          ) : (
                            <ApiOutlined className="shrink-0 text-xs text-primary" aria-hidden />
                          )}
                          {f}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </Card>
        </aside>
      </div>

      <GaleriaLightbox
        print={lightboxPrint}
        alt={lightboxPrint?.titulo || ""}
        onClose={() => setAbertoIndex(null)}
        {...(abertoIndex !== null &&
        formatGaleriaOrigem(galeria[abertoIndex]?.origem, draft.jiraEpicKey)
          ? {
              subtitle: formatGaleriaOrigem(
                galeria[abertoIndex]?.origem,
                draft.jiraEpicKey,
              )!,
            }
          : {})}
        {...(galeria.length > 1
          ? {
              onPrev: () =>
                setAbertoIndex((cur) =>
                  cur === null ? null : (cur - 1 + galeria.length) % galeria.length,
                ),
              onNext: () =>
                setAbertoIndex((cur) =>
                  cur === null ? null : (cur + 1) % galeria.length,
                ),
            }
          : {})}
        {...(onGaleriaChange
          ? {
              editable: true as const,
              onTitleChange: (titulo: string) => {
                if (abertoIndex === null) return;
                updateGaleriaItem(fullIndexForVisible(abertoIndex), { titulo });
              },
              onDelete: () => {
                if (abertoIndex === null) return;
                removeGaleriaItem(fullIndexForVisible(abertoIndex));
              },
            }
          : {})}
      />
    </div>
  );
}
