import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Compass, Map, Plug } from "lucide-react";
import { useMemo } from "react";

import loftLogo from "@/assets/loft-logo.png";
import { CaseCard } from "@/components/portal/old/CaseCard";
import { ResponsavelAvatar } from "@/components/portal/old/ResponsavelAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { integracaoLogoPorNome, integracaoLogos } from "@/data/logos";
import { usePortalContent } from "@/hooks/use-portal-content";
import { agruparPorResponsavel } from "@/lib/responsaveis";

const atalhos = [
  { titulo: "Todos os projetos", desc: "O que já foi construído", to: "/cases", icon: Compass },
  { titulo: "AI Map", desc: "Onde a IA já atua", to: "/mapa", icon: Map },
  { titulo: "Integrações", desc: "Sistemas conectados", to: "/ferramentas", icon: Plug },
  { titulo: "Impacto", desc: "IA em números", to: "/impacto", icon: BarChart3 },
] as const;

/** Stronger elevation for home page cards. */
const homeCardShadow =
  "shadow-[0_4px_12px_-3px_rgba(37,48,44,0.14),0_16px_40px_-10px_rgba(37,48,44,0.22)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_rgba(37,48,44,0.16),0_28px_56px_-12px_rgba(37,48,44,0.28)]";

function Secao({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: { label: string; to: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 sm:mt-20">
      <div className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="section-rule font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {titulo}
          </h2>
          {descricao && <p className="mt-3 text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {acao && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 rounded-full border-foreground/25 bg-card px-4 text-foreground shadow-sm hover:border-foreground/40 hover:bg-secondary"
          >
            <Link to={acao.to as never}>
              {acao.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

/** Classic Lovable aurora home (pre–Design Harmony). */
export function ClassicHome() {
  const { cases, integracoes, hydrated } = usePortalContent();

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
  const destaques = [...novos, ...cases.filter((c) => c.destaque && !c.novo)].slice(0, 3);
  const porResponsavel = [...agruparPorResponsavel(cases)].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
  );
  const integracoesPopulares = integracoes.slice(0, 4);

  const casePlaceholders = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-border/60 bg-secondary/50"
          aria-hidden
        />
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <section className="hero-aurora hero-edge rise-in px-4 pb-28 pt-14 text-center sm:px-6 sm:pb-32 sm:pt-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <img
              src={loftLogo}
              alt="Olivelas"
              width={240}
              height={207}
              className="h-[4.5rem] w-auto drop-shadow-[0_14px_34px_rgba(0,0,0,0.28)] sm:h-24"
            />
            <div className="text-left">
              <h1 className="font-display text-3xl font-bold leading-[1.05] text-white sm:text-4xl">
                Olivelas App Model
              </h1>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
            Acompanhe tudo o que estamos construindo, responsáveis e que etapa está cada projeto
          </p>
        </div>
      </section>

      <div className="canvas-panel -mt-16 min-h-[60vh] px-4 pb-24 pt-10 sm:px-6 sm:pt-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative z-20 -mt-10 mb-[-2.6rem] grid -translate-y-1/2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {atalhos.map((a) => (
              <Card key={a.titulo} className={`straddle-card overflow-hidden p-0 ${homeCardShadow}`}>
                <Link to={a.to} className="flex items-center gap-3 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 ring-1 ring-primary/20">
                    <a.icon className="h-5 w-5 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {a.titulo}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{a.desc}</span>
                  </span>
                </Link>
              </Card>
            ))}
          </div>

          <Secao
            titulo="Projetos em andamento"
            descricao="Soluções que estão mudando a rotina dos times."
            acao={{ label: "Ver todos os projetos", to: "/cases" }}
          >
            {!hydrated ? (
              casePlaceholders
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {destaques.map((c) => (
                  <CaseCard key={c.id} item={c} de="home" />
                ))}
              </div>
            )}
          </Secao>

          <Secao
            titulo="Projetos por responsáveis"
            descricao="Quem está tocando cada frente de IA na Olivelas."
            acao={{ label: "Ver todos os projetos", to: "/cases" }}
          >
            {!hydrated ? (
              <div className="grid gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-border/60 bg-secondary/50"
                    aria-hidden
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {porResponsavel.map((r) => (
                  <Card key={r.nome} className={`card-sheen group p-0 ${homeCardShadow}`}>
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
                        <span className="mt-0.5 inline-flex rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {r.cases.length} {r.cases.length === 1 ? "projeto" : "projetos"}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </Secao>

          <Secao
            titulo="Integrações já realizadas"
            descricao="O que os times estão usando no dia a dia."
            acao={{ label: "Ver todas", to: "/ferramentas" }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {integracoesPopulares.map((f) => {
                const logo = integracaoLogos[f.id] ?? integracaoLogoPorNome(f.nome);
                return (
                  <Card key={f.id} className={`card-sheen p-0 ${homeCardShadow}`}>
                    <Link to="/ferramentas/$id" params={{ id: f.id }} className="block p-5">
                      <span className="grid h-12 w-12 place-items-center rounded-full border bg-card p-2 shadow-md">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            width={28}
                            height={28}
                            loading="lazy"
                            className="h-7 w-7 object-contain"
                          />
                        ) : (
                          <Plug className="h-5 w-5 text-primary" />
                        )}
                      </span>
                      <h3 className="mt-3 text-base font-semibold">{f.nome}</h3>
                      <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">
                        {f.descricao}
                      </p>
                      <span className="mt-4 inline-block rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                        {f.categoria}
                      </span>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </Secao>

          <section className="mt-16 rounded-2xl bg-accent p-8 text-accent-foreground sm:mt-20 sm:p-12">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold sm:text-2xl">IA em números</h2>
                <p className="mt-1.5 text-sm text-accent-foreground/70">
                  Estimativas internas consolidadas para demonstração do portal.
                </p>
              </div>
              <Button asChild variant="secondary" size="sm" className="shrink-0">
                <Link to="/impacto">Ver impacto</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {metricasGerais.map((m) => (
                <div key={m.label}>
                  <p className="font-display text-3xl font-semibold sm:text-4xl">{m.valor}</p>
                  <p className="mt-1 text-sm text-accent-foreground/70">{m.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
