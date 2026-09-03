import { ArrowRightOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { usePortalContent } from "@/hooks/use-portal-content";

export const Route = createFileRoute("/impacto")({
  head: () => ({
    meta: [
      { title: "Impacto da IA na Loft — números consolidados" },
      {
        name: "description",
        content:
          "Horas economizadas, soluções em produção, pessoas impactadas e evolução mensal da adoção de IA na Loft.",
      },
      { property: "og:title", content: "Impacto da IA na Loft" },
      {
        property: "og:description",
        content: "Os números consolidados da adoção de IA nos times.",
      },
    ],
  }),
  component: ImpactoPage,
});

function ImpactoPage() {
  const { cases, hydrated } = usePortalContent();

  const metricasGerais = useMemo(
    () => [
      { label: "Soluções mapeadas", valor: String(cases.length) },
      {
        label: "Em produção",
        valor: String(cases.filter((c) => c.status === "Em produção").length),
      },
      {
        label: "Alto impacto",
        valor: String(cases.filter((c) => c.impacto === "Alto").length),
      },
      {
        label: "Áreas atendidas",
        valor: String(new Set(cases.map((c) => c.area.trim()).filter(Boolean)).size),
      },
    ],
    [cases],
  );

  const porArea = Array.from(
    cases.reduce((m, c) => m.set(c.area, (m.get(c.area) ?? 0) + 1), new Map<string, number>()),
  )
    .map(([area, valor]) => ({ area, valor }))
    .sort((a, b) => b.valor - a.valor);
  const maxArea = Math.max(...porArea.map((a) => a.valor), 1);

  const destaques = cases.filter((c) => c.impacto === "Alto").slice(0, 5);

  const areasResumo = porArea.map((item, index) => ({
    nome: item.area,
    horas: 0,
    projetos: item.valor,
    times: 0,
    cor: ["#115644", "#ff774a", "#25302c", "#cee79e", "#d94616"][index % 5]!,
  }));

  if (!hydrated) {
    return (
      <PageShell
        crumbs={[{ label: "Home", to: "/portal" }, { label: "Impacto" }]}
        eyebrow="Resultados"
        titulo="Impacto da IA na Loft"
        descricao="Carregando métricas do portal…"
      >
        <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
      </PageShell>
    );
  }

  return (
    <PageShell
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Impacto" }]}
      eyebrow="Resultados"
      titulo="Impacto da IA na Loft"
      descricao="O que a adoção de IA já devolveu para os times, em números consolidados."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricasGerais.map((m) => (
          <div
            key={m.label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
          >
            <p className="text-3xl font-semibold tabular-nums text-foreground">{m.valor}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {porArea.length > 0 ? (
          <Card className="border-border shadow-card lg:col-span-2" styles={{ body: { padding: 20 } }}>
            <h2 className="text-sm font-semibold">Soluções por área</h2>
            <div className="mt-6 space-y-4">
              {porArea.map((c) => (
                <div key={c.area}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span>{c.area}</span>
                    <span className="text-muted-foreground">{c.valor}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.valor / maxArea) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="border-border shadow-card lg:col-span-2" styles={{ body: { padding: 24 } }}>
            <p className="text-[13px] text-muted-foreground">
              Nenhum projeto cadastrado ainda. Importe cases pelo admin para ver o impacto consolidado.
            </p>
          </Card>
        )}
      </div>

      {areasResumo.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">Impacto por área</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areasResumo.map((a) => (
              <Card
                key={a.nome}
                className="border-border shadow-card"
                styles={{ body: { padding: 20 } }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.cor }} />
                  <p className="text-sm font-semibold">{a.nome}</p>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">
                  {a.horas.toLocaleString("pt-BR")}h
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {a.projetos} soluções · {a.times} times
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Cases de maior impacto</h2>
        <div className="grid gap-2">
          {destaques.map((c) => (
            <Card
              key={c.id}
              className="group border-border shadow-none transition-colors hover:border-primary/40"
              styles={{ body: { padding: 0 } }}
              size="small"
            >
              <Link
                to="/cases/$id"
                params={{ id: c.id }}
                search={{ de: "impacto" }}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{c.nome}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.area} · {c.resultados[0]?.valor} {c.resultados[0]?.label}
                  </span>
                </span>
                <ArrowRightOutlined className="shrink-0 text-muted-foreground group-hover:text-primary" />
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
