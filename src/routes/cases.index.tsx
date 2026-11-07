import { CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Card, Input } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { CaseCard } from "@/components/portal/CaseCard";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import { SegmentedTabs } from "@/components/portal/SegmentedTabs";
import { usePortalContent } from "@/hooks/use-portal-content";
import { agruparPorResponsavel, isConcluido, nomeResponsavel } from "@/lib/responsaveis";

export const Route = createFileRoute("/cases/")({
  validateSearch: (search: Record<string, unknown>): { responsavel?: string } =>
    typeof search["responsavel"] === "string" && search["responsavel"]
      ? { responsavel: search["responsavel"] as string }
      : {},
  head: () => ({
    meta: [
      { title: "Projetos — Olivelas App Model" },
      {
        name: "description",
        content:
          "Projetos, automações, agentes e experimentos de IA construídos pelos times da Olivelas, com responsáveis, impacto e integrações.",
      },
      { property: "og:title", content: "Projetos de IA — Olivelas App Model" },
      {
        property: "og:description",
        content: "Explore projetos de IA por área, integração e responsável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasesPage,
});

const unico = (v: string[]) => [...new Set(v)].sort();

function Grupo({
  titulo,
  opcoes,
  ativo,
  onToggle,
}: {
  titulo: string;
  opcoes: string[];
  ativo: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {opcoes.map((o) => {
          const on = ativo.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors ${
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Aba = "andamento" | "concluidos";

function CasesPage() {
  const { responsavel: responsavelParam } = Route.useSearch();
  const { cases, hydrated } = usePortalContent();
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState<string[]>([]);
  const [ferramenta, setFerramenta] = useState<string[]>([]);
  const [responsavel, setResponsavel] = useState<string[]>(
    responsavelParam ? [responsavelParam] : [],
  );
  const [aba, setAba] = useState<Aba>("andamento");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    if (responsavelParam) setResponsavel([responsavelParam]);
  }, [responsavelParam]);

  const lista = cases;

  const toolsOf = (c: (typeof lista)[number]) => c.ferramentas ?? [];

  const opcoes = useMemo(
    () => ({
      areas: unico(lista.map((c) => c.area)),
      ferramentas: unico(lista.flatMap((c) => toolsOf(c))),
      responsaveis: agruparPorResponsavel(lista),
    }),
    [lista],
  );

  const toggle = (set: (fn: (v: string[]) => string[]) => void) => (v: string) =>
    set((atual) => (atual.includes(v) ? atual.filter((x) => x !== v) : [...atual, v]));

  const filtradosSemAba = lista.filter((c) => {
    const q = busca.trim().toLowerCase();
    const tools = toolsOf(c);
    const resp = nomeResponsavel(c);
    const textoOk =
      !q ||
      [c.nome, c.descricao, c.time, resp, ...c.tags, ...tools]
        .join(" ")
        .toLowerCase()
        .includes(q);
    return (
      textoOk &&
      (!area.length || area.includes(c.area)) &&
      (!responsavel.length || responsavel.includes(resp)) &&
      (!ferramenta.length || tools.some((f) => ferramenta.includes(f)))
    );
  });

  const emAndamento = filtradosSemAba.filter((c) => !isConcluido(c));
  const concluidos = filtradosSemAba.filter((c) => isConcluido(c));
  const filtrados = aba === "andamento" ? emAndamento : concluidos;

  const totalFiltros = area.length + ferramenta.length + responsavel.length;

  const limpar = () => {
    setArea([]);
    setFerramenta([]);
    setResponsavel([]);
    setBusca("");
  };

  return (
    <PageShell
      maxLargura="max-w-[1400px]"
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Projetos" }]}
      eyebrow="Projetos internos"
      titulo="O que já estamos construindo com IA"
      descricao="Projetos, automações, agentes e experimentos em andamento nos times. Use os filtros para encontrar algo parecido com o seu desafio."
      acoes={
        <Button
          type="default"
          icon={<FilterOutlined />}
          className="lg:hidden"
          onClick={() => setMostrarFiltros((v) => !v)}
        >
          Filtros{totalFiltros ? ` (${totalFiltros})` : ""}
        </Button>
      }
    >
      <SegmentedTabs
        straddle
        valor={aba}
        onChange={(v) => setAba(v)}
        itens={[
          { value: "andamento" as Aba, label: "Em andamento", count: emAndamento.length },
          { value: "concluidos" as Aba, label: "Concluídos", count: concluidos.length },
        ]}
      />

      {/*
        Filter column width matches one card column: (100% - 3×gap) / 4.
        gap-6 = 1.5rem → three gutters between four tracks = 4.5rem.
      */}
      <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start">
        <aside
          className={`${mostrarFiltros ? "block" : "hidden"} relative w-full shrink-0 lg:block lg:w-[calc((100%-4.5rem)/4)]`}
        >
          <Card
            className="filters-sticky w-full border-border shadow-card lg:sticky lg:top-4 lg:z-20"
            styles={{ body: { padding: 20 } }}
          >
            <div className="space-y-5">
              <p className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {filtrados.length}
                <span className="ml-2 font-sans text-sm font-medium text-muted-foreground sm:text-base">
                  {filtrados.length === 1 ? "projeto encontrado" : "projetos encontrados"}
                </span>
              </p>
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nos projetos..."
                size="large"
                className="rounded-xl"
              />
              <Grupo titulo="Área" opcoes={opcoes.areas} ativo={area} onToggle={toggle(setArea)} />

              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Responsáveis
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {opcoes.responsaveis.map((r) => {
                    const on = responsavel.includes(r.nome);
                    return (
                      <button
                        key={r.nome}
                        onClick={() => toggle(setResponsavel)(r.nome)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs transition-colors ${
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <ResponsavelAvatar
                          nome={r.nome}
                          avatarUrl={r.avatarUrl}
                          className="h-5 w-5 text-[9px]"
                        />
                        <span className="max-w-[9rem] truncate">{r.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Grupo
                titulo="Integrações"
                opcoes={opcoes.ferramentas}
                ativo={ferramenta}
                onToggle={toggle(setFerramenta)}
              />
              {(totalFiltros > 0 || busca) && (
                <Button type="text" icon={<CloseOutlined />} block onClick={limpar}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          {!hydrated ? (
            <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-border/60 bg-secondary/50"
                  aria-hidden
                />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <Card className="shadow-card" styles={{ body: { padding: 48, textAlign: "center" } }}>
              <div className="flex flex-col items-center gap-3">
                <p className="font-display text-lg font-semibold">
                  {aba === "andamento"
                    ? "Nenhum projeto em andamento com esses filtros"
                    : "Nenhum projeto concluído com esses filtros"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Tente remover algum filtro ou trocar de aba. Se ainda não existe nada parecido,
                  essa pode ser uma boa oportunidade.
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button type="default" onClick={limpar}>
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid auto-rows-fr items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((c) => (
                <div key={c.id} className="min-h-0 min-w-0 h-full">
                  <CaseCard item={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
