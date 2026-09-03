import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Button, Card } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { StatusBadge } from "@/components/portal/CaseCard";
import { LoftMark } from "@/components/portal/LoftMark";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import { SegmentedTabs } from "@/components/portal/SegmentedTabs";
import type { CaseItem } from "@/data/types";
import { usePortalContent } from "@/hooks/use-portal-content";
import { agruparPorResponsavel, nomeResponsavel } from "@/lib/responsaveis";
import { cn, contrastOnBackground } from "@/lib/utils";

export const Route = createFileRoute("/mapa")({
  validateSearch: (search: Record<string, unknown>): { area?: string | undefined } =>
    typeof search["area"] === "string" ? { area: search["area"] as string } : {},

  head: () => ({
    meta: [
      { title: "Mapa de IA na Loft — áreas e soluções" },
      {
        name: "description",
        content:
          "Visualize onde a IA já atua na Loft: soluções por área, times envolvidos e horas economizadas em cada frente.",
      },
      { property: "og:title", content: "Mapa de IA na Loft" },
      {
        property: "og:description",
        content: "Um panorama por área de negócio das soluções de IA em uso.",
      },
    ],
  }),
  component: MapaPage,
});

const FALLBACK_COLORS = ["#115644", "#25302c", "#ff774a", "#d94616", "#cee79e", "#ebebeb"];

const balloonShadow =
  "shadow-[0_8px_24px_-6px_rgba(37,48,44,0.18),0_20px_48px_-14px_rgba(37,48,44,0.22)]";

const cardItemShadow =
  "shadow-[0_3px_10px_-2px_rgba(37,48,44,0.12),0_10px_24px_-8px_rgba(37,48,44,0.18)]";

type MapArea = {
  nome: string;
  descricao: string;
  cor: string;
  projetos: number;
};

function Connector({ alignTop }: { alignTop: number }) {
  return (
    <div
      className="relative mx-1 w-10 shrink-0 sm:mx-2 sm:w-14"
      style={{ marginTop: alignTop + 18 }}
      aria-hidden
    >
      <div className="relative h-[3px] w-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent shadow-[0_0_12px_rgba(255,119,74,0.45)]">
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20" />
      </div>
    </div>
  );
}

function MapaPage() {
  const { area } = Route.useSearch();
  const { cases, areas: portalAreas, hydrated } = usePortalContent();
  const [vista, setVista] = useState<"areas" | "responsaveis">("areas");
  const [ativa, setAtiva] = useState<string | null>(area ?? null);
  const [caseAtivo, setCaseAtivo] = useState<CaseItem | null>(null);
  const [solutionsTop, setSolutionsTop] = useState(0);
  const [previewTop, setPreviewTop] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const areasColumnRef = useRef<HTMLDivElement>(null);
  const solutionsBalloonRef = useRef<HTMLDivElement>(null);
  const previewBalloonRef = useRef<HTMLDivElement>(null);
  const areaRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const solutionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const alvo = useRef<HTMLDivElement>(null);

  const customAreas = portalAreas;

  const mapaAreas = useMemo<MapArea[]>(() => {
    const counts = new Map<string, number>();
    for (const item of cases) {
      const nome = item.area.trim();
      if (!nome) continue;
      counts.set(nome, (counts.get(nome) ?? 0) + 1);
    }

    const fromCatalog: MapArea[] = customAreas.map((nome, index) => ({
      nome,
      descricao: "Soluções de IA cadastradas para esta área.",
      cor: FALLBACK_COLORS[index % FALLBACK_COLORS.length]!,
      projetos: counts.get(nome) ?? 0,
    }));

    const known = new Set(fromCatalog.map((a) => a.nome.toLowerCase()));
    const extras = [...counts.keys()]
      .filter((nome) => nome && !known.has(nome.toLowerCase()))
      .map((nome, index) => ({
        nome,
        descricao: "Soluções de IA cadastradas para esta área.",
        cor: FALLBACK_COLORS[(fromCatalog.length + index) % FALLBACK_COLORS.length]!,
        projetos: counts.get(nome) ?? 0,
      }));

    return [...fromCatalog, ...extras].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
    );
  }, [cases, customAreas, hydrated]);

  const responsaveis = useMemo(() => agruparPorResponsavel(cases), [cases]);

  const daArea = ativa
    ? vista === "areas"
      ? cases.filter((c) => c.area === ativa)
      : cases.filter((c) => nomeResponsavel(c) === ativa)
    : [];
  const areaMeta = mapaAreas.find((a) => a.nome === ativa);

  useEffect(() => {
    if (!area) return;
    setAtiva(area);
    setCaseAtivo(null);
    alvo.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [area]);

  useEffect(() => {
    setCaseAtivo(null);
  }, [ativa]);

  /** Keep the horizontal scroller focused on the rightmost open balloon. */
  const scrollMapToReveal = (el: HTMLElement | null) => {
    const scroller = mapRef.current;
    if (!scroller || !el) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const padding = 28;
    let delta = 0;
    if (elRect.right > scrollerRect.right - padding) {
      delta = elRect.right - scrollerRect.right + padding;
    } else if (elRect.left < scrollerRect.left + padding) {
      delta = elRect.left - scrollerRect.left - padding;
    }
    if (delta !== 0) {
      scroller.scrollBy({ left: delta, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!ativa) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) scrollMapToReveal(solutionsBalloonRef.current);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [ativa, solutionsTop, daArea.length]);

  useEffect(() => {
    if (!caseAtivo) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) scrollMapToReveal(previewBalloonRef.current);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [caseAtivo, previewTop]);

  /** Align a balloon with a source node, clamped so it stays inside the map row. */
  const clampBalloonTop = (
    source: HTMLElement | null,
    balloon: HTMLElement | null,
    column: HTMLElement | null,
  ) => {
    const row = rowRef.current;
    if (!row || !source) return 0;
    const raw = source.getBoundingClientRect().top - row.getBoundingClientRect().top;
    let top = Math.max(0, raw);
    const limitEl = column ?? areasColumnRef.current;
    if (balloon && limitEl) {
      const limitHeight = limitEl.getBoundingClientRect().height;
      const balloonHeight = balloon.getBoundingClientRect().height;
      if (balloonHeight > 0 && limitHeight > 0) {
        top = Math.min(top, Math.max(0, limitHeight - balloonHeight));
      }
    }
    return top;
  };

  useLayoutEffect(() => {
    if (!ativa) {
      setSolutionsTop(0);
      return;
    }
    const sync = () => {
      setSolutionsTop(
        clampBalloonTop(
          areaRefs.current[ativa] ?? null,
          solutionsBalloonRef.current,
          areasColumnRef.current,
        ),
      );
    };
    sync();
    const balloon = solutionsBalloonRef.current;
    const column = areasColumnRef.current;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (balloon) ro?.observe(balloon);
    if (column) ro?.observe(column);
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [ativa, mapaAreas, daArea, vista]);

  useLayoutEffect(() => {
    if (!caseAtivo) {
      setPreviewTop(0);
      return;
    }
    const sync = () => {
      setPreviewTop(
        clampBalloonTop(
          solutionRefs.current[caseAtivo.id] ?? null,
          previewBalloonRef.current,
          solutionsBalloonRef.current,
        ),
      );
    };
    sync();
    const balloon = previewBalloonRef.current;
    const column = solutionsBalloonRef.current;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (balloon) ro?.observe(balloon);
    if (column) ro?.observe(column);
    window.addEventListener("resize", sync);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [caseAtivo, daArea]);

  return (
    <PageShell
      maxLargura="max-w-[1400px]"
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Mapa de IA" }]}
      eyebrow="Panorama"
      titulo="Mapa de IA na Loft"
      descricao={
        <>
          Clique em uma área para abrir as soluções. Clique de novo na área para fechar.
          <br />
          Clique em uma solução para ver a prévia do case — como um mapa mental.
        </>
      }
    >
      <div ref={alvo} />

      <SegmentedTabs
        straddle
        valor={vista}
        onChange={(v) => {
          setVista(v);
          setAtiva(null);
          setCaseAtivo(null);
        }}
        itens={[
          { value: "areas" as const, label: "Áreas", count: mapaAreas.length },
          { value: "responsaveis" as const, label: "Responsáveis", count: responsaveis.length },
        ]}
      />

      <div
        ref={mapRef}
        className="max-w-full overflow-x-auto overflow-y-hidden pb-6 pl-3 pr-3 [-ms-overflow-style:none] [scrollbar-width:thin] sm:pl-4 sm:pr-4"
      >
        <div ref={rowRef} className="relative flex w-max max-w-none items-start gap-0 py-1">
          {/* Column 1 — areas */}
          <div
            ref={areasColumnRef}
            className="w-[min(100%,280px)] shrink-0 space-y-3 sm:w-[300px]"
          >
            {vista === "responsaveis"
              ? responsaveis.map((r) => {
                  const selecionada = r.nome === ativa;
                  return (
                    <button
                      key={r.nome}
                      ref={(node) => {
                        areaRefs.current[r.nome] = node;
                      }}
                      type="button"
                      onClick={() => {
                        if (selecionada) {
                          setAtiva(null);
                          setCaseAtivo(null);
                          return;
                        }
                        setAtiva(r.nome);
                      }}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                        "[filter:drop-shadow(0_6px_14px_rgba(37,48,44,0.14))_drop-shadow(0_2px_5px_rgba(37,48,44,0.1))]",
                        selecionada
                          ? "border-primary/50 bg-card ring-2 ring-primary/40"
                          : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/30",
                      )}
                    >
                      <ResponsavelAvatar
                        nome={r.nome}
                        avatarUrl={r.avatarUrl}
                        className="h-14 w-14 text-sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{r.nome}</span>
                        <span className="mt-1 inline-flex rounded-full border border-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {r.cases.length} {r.cases.length === 1 ? "projeto" : "projetos"}
                        </span>
                      </span>
                    </button>
                  );
                })
              : mapaAreas.map((a) => {
              const selecionada = a.nome === ativa;
              const tone = contrastOnBackground(a.cor);
              return (
                <button
                  key={a.nome}
                  ref={(node) => {
                    areaRefs.current[a.nome] = node;
                  }}
                  type="button"
                  onClick={() => {
                    if (selecionada) {
                      setAtiva(null);
                      setCaseAtivo(null);
                      return;
                    }
                    setAtiva(a.nome);
                  }}
                  className={cn(
                    "w-full cursor-pointer rounded-2xl border p-4 text-left transition-all",
                    "[filter:drop-shadow(0_6px_14px_rgba(37,48,44,0.14))_drop-shadow(0_2px_5px_rgba(37,48,44,0.1))]",
                    selecionada
                      ? "border-transparent ring-2 ring-primary/40"
                      : "border-border/70 bg-card hover:-translate-y-0.5 hover:border-primary/30",
                  )}
                  style={
                    selecionada
                      ? { backgroundColor: a.cor, color: tone.text }
                      : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold sm:text-base">{a.nome}</p>
                    <ApartmentOutlined
                      className={cn(
                        "mt-0.5 shrink-0 text-sm",
                        selecionada ? "opacity-80" : "text-primary",
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1.5 line-clamp-2 text-xs leading-relaxed",
                      !selecionada && "text-muted-foreground",
                    )}
                    style={selecionada ? { color: tone.muted } : undefined}
                  >
                    {a.descricao}
                  </p>
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border border-primary px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      selecionada ? "text-white" : "text-primary",
                    )}
                  >
                    {a.projetos} {a.projetos === 1 ? "solução" : "soluções"}
                  </span>
                </button>
              );
                })}
          </div>

          {ativa ? (
            <>
              <Connector alignTop={solutionsTop} />

              <div
                ref={solutionsBalloonRef}
                className="w-[min(100%,340px)] max-w-[340px] shrink-0 sm:w-[360px] sm:max-w-[360px]"
                style={{ marginTop: solutionsTop }}
              >
                <Card
                  className={cn(
                    "max-h-[min(70vh,560px)] overflow-hidden rounded-[22px] border border-border/70 bg-card",
                    balloonShadow,
                  )}
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    className="border-b border-border/60 px-4 py-3"
                    style={
                      areaMeta
                        ? {
                            background: `linear-gradient(135deg, ${areaMeta.cor}18, transparent)`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                          Soluções aplicadas
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">{ativa}</p>
                      </div>
                      <span className="inline-flex rounded-full border border-primary/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                        {daArea.length} {daArea.length === 1 ? "solução" : "soluções"}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-[min(60vh,480px)] space-y-3 overflow-y-auto p-3">
                    {daArea.map((c) => {
                      const open = caseAtivo?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          ref={(node) => {
                            solutionRefs.current[c.id] = node;
                          }}
                          type="button"
                          onClick={() => setCaseAtivo(open ? null : c)}
                          className={cn(
                            "w-full cursor-pointer rounded-xl border bg-card p-3.5 text-left transition-all",
                            cardItemShadow,
                            open
                              ? "border-primary/50 ring-2 ring-primary/25"
                              : "border-border/70 hover:border-primary/30",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium leading-snug whitespace-normal">
                                {c.nome}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {c.status}
                              </span>
                            </span>
                            <ArrowRightOutlined
                              className={cn(
                                "mt-0.5 shrink-0 text-muted-foreground transition-transform",
                                open && "translate-x-0.5 text-primary",
                              )}
                            />
                          </div>
                        </button>
                      );
                    })}
                    {daArea.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Ainda não há cases publicados para esta área.
                      </p>
                    ) : null}
                  </div>
                </Card>
              </div>
            </>
          ) : null}

          {ativa && caseAtivo ? (
            <>
              <Connector alignTop={previewTop} />

              <div
                ref={previewBalloonRef}
                className="w-[min(100%,400px)] max-w-[400px] shrink-0 sm:w-[420px] sm:max-w-[420px]"
                style={{ marginTop: previewTop }}
              >
                <Card
                  className={cn(
                    "max-h-[min(70vh,640px)] overflow-y-auto rounded-[22px] border border-border/70 bg-card",
                    balloonShadow,
                  )}
                  styles={{ body: { padding: 0 } }}
                >
                  <div
                    className="relative overflow-hidden p-5 text-white"
                    style={{ backgroundColor: caseAtivo.cor }}
                  >
                    <button
                      type="button"
                      onClick={() => setCaseAtivo(null)}
                      className="absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/25 text-white/90 backdrop-blur-sm hover:bg-black/40"
                      aria-label="Fechar prévia do case"
                    >
                      <CloseOutlined />
                    </button>
                    <LoftMark
                      backgroundColor={caseAtivo.cor}
                      className="mb-4 h-7 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                    />
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
                      Prévia do case
                    </p>
                    <p className="mt-2 pr-8 text-lg font-semibold leading-snug">{caseAtivo.nome}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85">
                      {caseAtivo.descricao}
                    </p>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={caseAtivo.status} />
                      <span className="text-xs text-muted-foreground">{caseAtivo.area}</span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl border border-border/70 bg-card p-4",
                        cardItemShadow,
                      )}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Problema
                      </p>
                      <p className="mt-1.5 line-clamp-5 text-sm leading-relaxed text-foreground/85">
                        {caseAtivo.problema}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl border border-border/70 bg-card p-4",
                        cardItemShadow,
                      )}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Solução
                      </p>
                      <p className="mt-1.5 line-clamp-5 text-sm leading-relaxed text-foreground/85">
                        {caseAtivo.solucao}
                      </p>
                    </div>
                    <Link
                      to="/cases/$id"
                      params={{ id: caseAtivo.id }}
                      search={{ de: "mapa" }}
                      className="block"
                    >
                      <Button
                        type="primary"
                        block
                        className="cursor-pointer rounded-full"
                        icon={<ArrowRightOutlined />}
                        iconPosition="end"
                      >
                        Abrir case completo
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
