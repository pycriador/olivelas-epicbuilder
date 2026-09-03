import {
  ApiOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Card, Input } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import { CaseCard } from "@/components/portal/CaseCard";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import { integracaoLogoPorNome, integracaoLogos } from "@/data/logos";
import { usePortalContent } from "@/hooks/use-portal-content";
import { agruparPorResponsavel } from "@/lib/responsaveis";

const atalhos = [
  {
    titulo: "Todos os projetos",
    desc: "O que já foi construído pelos times com IA.",
    to: "/cases",
    icon: CompassOutlined,
    cta: "Explorar",
  },
  {
    titulo: "AI Map",
    desc: "Veja onde a IA já atua em cada área da Loft.",
    to: "/mapa",
    icon: EnvironmentOutlined,
    cta: "Abrir mapa",
    highlight: true,
  },
] as const;

const quickLinks = [
  { titulo: "Integrações", desc: "Sistemas conectados às soluções.", to: "/ferramentas", icon: ApiOutlined },
  { titulo: "Impacto", desc: "IA em números para a operação.", to: "/impacto", icon: BarChartOutlined },
] as const;

const HERO_GREEN = "oklch(0.40 0.10 162)";

function firstName(full: string): string {
  const part = full.trim().split(/\s+/)[0];
  return part || "time";
}

function monthLabel(date = new Date()): string {
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "")
    .toUpperCase();
}

/** Design Harmony authenticated home. */
export function PortalHome() {
  const { cases, integracoes, hydrated } = usePortalContent();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const greetingName = firstName(displayName || user?.email || "time");
  const period = monthLabel();

  const metricasGerais = useMemo(
    () => [
      { label: "Soluções mapeadas", valor: String(cases.length) },
      {
        label: "Em produção",
        valor: String(cases.filter((c) => c.status === "Em produção").length),
      },
      {
        label: "Times envolvidos",
        valor: String(new Set(cases.map((c) => (c.time ?? "").trim()).filter(Boolean)).size),
      },
      {
        label: "Integrações",
        valor: String(integracoes.length),
      },
    ],
    [cases, integracoes.length],
  );

  const novos = cases.filter((c) => c.novo);
  const pendencias = novos.length || cases.filter((c) => c.status === "Em desenvolvimento").length;
  const destaques = [...novos, ...cases.filter((c) => c.destaque && !c.novo)].slice(0, 3);
  const porResponsavel = [...agruparPorResponsavel(cases)]
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }))
    .slice(0, 5);
  const integracoesPopulares = integracoes.slice(0, 4);

  const submitSearch = () => {
    const query = q.trim();
    if (!query) return;
    void navigate({ to: "/busca", search: { q: query } });
  };

  const casePlaceholders = (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-[var(--radius-lg)] border border-border bg-card"
          aria-hidden
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 xl:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-6">
            {/* Hero — aligned with aiops-loft-design-system /portal */}
            <section
              className="relative overflow-hidden rounded-2xl border border-border p-6 md:p-8"
              style={{ background: HERO_GREEN, color: "oklch(0.98 0.005 160)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 18% 20%, oklch(1 0 0 / 0.18) 0, transparent 45%), radial-gradient(circle at 88% 75%, oklch(1 0 0 / 0.12) 0, transparent 40%)",
                }}
                aria-hidden
              />
              <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
                    <ThunderboltOutlined className="text-xs" />
                    Novidade
                  </span>
                  <h1 className="mt-3 text-2xl font-semibold leading-tight md:text-3xl">
                    IA com agilidade e{" "}
                    <br className="hidden md:block" />
                    clareza em tempo real.
                  </h1>
                  <p className="mt-2 max-w-md text-sm text-white/85">
                    Acompanhe projetos, responsáveis e o estágio de cada solução de Inteligência
                    Artificial da Loft em um só lugar.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/cases">
                      <Button type="primary">
                        Ver projetos
                        <ArrowUpOutlined className="rotate-45" />
                      </Button>
                    </Link>
                    <Link to="/mapa">
                      <Button
                        ghost
                        className="!border-white/30 !text-white hover:!border-white/50 hover:!bg-white/15 hover:!text-white"
                      >
                        Abrir AI Map
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:grid place-items-center">
                  <div className="grid w-full max-w-[280px] grid-cols-2 gap-3">
                    {metricasGerais.slice(0, 4).map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                      >
                        <div className="text-2xl font-semibold tabular-nums">{m.valor}</div>
                        <div className="mt-1 text-[11px] leading-snug text-white/75">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Feature row */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {atalhos.map((a) => (
                <article
                  key={a.titulo}
                  className={`flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 ${
                    "highlight" in a && a.highlight
                      ? "border-primary/40 shadow-card"
                      : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full ${
                          "highlight" in a && a.highlight
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary/40 text-primary"
                        }`}
                      >
                        <a.icon className="text-sm" />
                      </span>
                      <h2 className="text-base font-semibold">{a.titulo}</h2>
                    </div>
                    <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                      {a.desc}
                    </p>
                  </div>
                  <Link to={a.to}>
                    <Button type={"highlight" in a && a.highlight ? "primary" : "default"}>
                      {a.cta}
                    </Button>
                  </Link>
                </article>
              ))}
            </section>

            {/* KPI row */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Sua operação de IA</h2>
                <Link to="/impacto" className="text-xs font-medium text-primary hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {metricasGerais.map((m) => (
                  <div
                    key={m.label}
                    className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
                  >
                    <div className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {period}
                    </div>
                    <div className="text-3xl font-semibold tabular-nums">{hydrated ? m.valor : "—"}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{m.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Projetos em andamento</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Soluções que estão mudando a rotina dos times.
                  </p>
                </div>
                <Link to="/cases">
                  <Button type="default" size="small">
                    Ver todos
                    <ArrowRightOutlined />
                  </Button>
                </Link>
              </div>
              {!hydrated ? (
                casePlaceholders
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {destaques.map((c) => (
                    <CaseCard key={c.id} item={c} de="home" />
                  ))}
                </div>
              )}
            </section>

            {/* Owners */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Projetos por responsáveis</h2>
                <Link to="/cases" className="text-xs font-medium text-primary hover:underline">
                  Ver todos
                </Link>
              </div>
              {!hydrated ? (
                <div className="grid gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-xl border border-border bg-card"
                      aria-hidden
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-2">
                  {porResponsavel.map((r) => (
                    <Card
                      key={r.nome}
                      size="small"
                      styles={{ body: { padding: 0 } }}
                      className="group border-border shadow-none"
                    >
                      <Link
                        to="/cases"
                        search={{ responsavel: r.nome }}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4"
                      >
                        <ResponsavelAvatar
                          nome={r.nome}
                          avatarUrl={r.avatarUrl}
                          className="h-10 w-10 text-xs"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{r.nome}</span>
                          {r.email ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {r.email}
                            </span>
                          ) : null}
                          <span className="mt-1 inline-flex rounded-md border border-primary/25 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {r.cases.length} {r.cases.length === 1 ? "projeto" : "projetos"}
                          </span>
                        </span>
                        <ArrowRightOutlined className="shrink-0 text-muted-foreground group-hover:text-primary" />
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Integrations */}
            <section>
              <h2 className="mb-3 text-sm font-semibold">Integrações já realizadas</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {integracoesPopulares.map((f) => {
                  const logo = integracaoLogos[f.id] ?? integracaoLogoPorNome(f.nome);
                  return (
                    <Link key={f.id} to="/ferramentas/$id" params={{ id: f.id }}>
                      <article className="group h-full rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card p-2">
                              {logo ? (
                                <img
                                  src={logo}
                                  alt=""
                                  width={24}
                                  height={24}
                                  loading="lazy"
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <ApiOutlined className="text-lg text-primary" />
                              )}
                            </span>
                            <h3 className="truncate text-[15px] font-semibold">{f.nome}</h3>
                          </div>
                          <ArrowUpOutlined className="rotate-45 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                          {f.descricao}
                        </p>
                        <span className="mt-3 inline-block rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {f.categoria}
                        </span>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right rail */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <section className="rounded-xl border border-border bg-card p-4">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Olá, {greetingName} 👋</h3>
                <ArrowRightOutlined className="text-muted-foreground" />
              </header>
              <p className="text-[13px] text-muted-foreground">
                Aqui você pode buscar por projetos, responsáveis, integrações e muito mais.
              </p>
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
              >
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Pesquisar"
                  prefix={<SearchOutlined className="text-muted-foreground" />}
                  allowClear
                />
                <Button type="primary" htmlType="submit" aria-label="Buscar" icon={<ArrowRightOutlined />} />
              </form>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <header className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Central de ações</h3>
                <Link to="/cases">
                  <ArrowRightOutlined className="text-muted-foreground hover:text-primary" />
                </Link>
              </header>
              <div className="text-5xl font-semibold leading-none tabular-nums">
                {hydrated ? String(pendencias).padStart(2, "0") : "—"}
              </div>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {pendencias === 1
                  ? "Item precisa da sua atenção hoje."
                  : "Itens precisam da sua atenção hoje."}
              </p>
            </section>

            {quickLinks.map((item) => (
              <Link key={item.titulo} to={item.to}>
                <section className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <header className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                      <item.icon className="text-primary" />
                      {item.titulo}
                    </h3>
                    <ArrowRightOutlined className="text-muted-foreground" />
                  </header>
                  <p className="text-[13px] text-muted-foreground">{item.desc}</p>
                </section>
              </Link>
            ))}

            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">Fale com o time</h3>
              <p className="text-[13px] text-muted-foreground">
                Dúvidas sobre um projeto ou quer cadastrar uma nova solução? Use o assistente ou fale
                com o responsável listado no card do projeto.
              </p>
              <Link to="/assistente" search={{ q: "" }} className="mt-3 inline-block">
                <Button type="primary" size="small">
                  Abrir assistente
                </Button>
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
