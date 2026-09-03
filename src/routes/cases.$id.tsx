import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  AimOutlined,
  ApiOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  BulbOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExpandOutlined,
  LineChartOutlined,
  PictureOutlined,
  ReloadOutlined,
  RocketOutlined,
  SwapOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Modal } from "antd";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";

import { JiraImportLoading } from "@/components/admin/JiraImportLoading";
import { PageShell } from "@/components/layout/PageShell";
import { StatusBadge } from "@/components/portal/CaseCard";
import { GaleriaLightbox } from "@/components/portal/GaleriaLightbox";
import { LoftMark } from "@/components/portal/LoftMark";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import { isVideoMedia, type Print } from "@/data/galeria";
import { hydrateGaleria } from "@/lib/gallery-store";
import { contrastOnBackground } from "@/lib/utils";
import { integracaoLogoPorNome, logoDaIntegracao as resolveLogo } from "@/data/logos";
import { usePortalContent } from "@/hooks/use-portal-content";
import { saveCustomCase, getCaseMeta as lerCaseMeta } from "@/lib/content-store";
import { syncCaseToConfluence } from "@/lib/confluence-sync";
import { importCaseFromJira, resolveApiAssetUrl } from "@/lib/jira-import";
import { responsavelDoCase } from "@/lib/responsaveis";

function ContentPending() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-[66%] animate-pulse rounded bg-secondary" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/cases/$id")({
  validateSearch: (search: Record<string, unknown>): { de?: string | undefined } =>
    typeof search["de"] === "string" ? { de: search["de"] as string } : {},
  loader: ({ params }) => ({
    id: params.id,
    nome: "Case",
    descricao: "Detalhe do case de IA.",
  }),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.nome ?? "Case"} — Cases de IA | Loft` },
      { name: "description", content: loaderData?.descricao ?? "" },
      { property: "og:title", content: `${loaderData?.nome ?? "Case"} — AI Portal Loft` },
    ],
  }),
  component: CaseDetalhe,
});

function Bloco({
  titulo,
  icone: Icone,
  children,
}: {
  titulo: string;
  icone: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
          <Icone className="text-base text-primary" />
        </span>
        <h2 className="text-xl font-semibold sm:text-2xl">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function resolveIntegracao(
  nome: string,
  catalogo: ReturnType<typeof usePortalContent>["integracoes"],
) {
  return (
    catalogo.find((i) => i.nome.toLowerCase() === nome.toLowerCase()) ??
    catalogo.find((i) => i.id === nome.toLowerCase().replace(/\s+/g, "-"))
  );
}

const origens: Record<string, { label: string; to: string }> = {
  mapa: { label: "Mapa de IA", to: "/mapa" },
  impacto: { label: "IA em números", to: "/impacto" },
  busca: { label: "Busca", to: "/busca" },
  cases: { label: "Projetos", to: "/cases" },
};

function CaseDetalhe() {
  const { id } = Route.useParams();
  const { de } = Route.useSearch();
  const navigate = useNavigate();
  const { getCase, getCaseMeta, hydrated, deleteCase, integracoes: catalogoIntegracoes, refresh } =
    usePortalContent();
  const [atualizando, setAtualizando] = useState(false);
  const item = getCase(id);
  const meta = getCaseMeta(id);
  const [aberto, setAberto] = useState<Print | null>(null);
  const [galeria, setGaleria] = useState<Print[]>(() => meta?.galeria ?? []);

  const galeriaBase = useMemo(() => meta?.galeria ?? [], [meta?.galeria]);

  useEffect(() => {
    let active = true;
    setGaleria(galeriaBase);
    void hydrateGaleria(galeriaBase).then((resolved) => {
      if (active) setGaleria(resolved);
    });
    return () => {
      active = false;
    };
  }, [galeriaBase]);
  const dores = meta?.dores?.filter(Boolean) ?? [];
  const integracaoNomes = (() => {
    if (meta?.semIntegracoes) return [];
    if (meta && "integracoes" in meta) return meta.integracoes ?? [];
    const catalogNames = new Set(catalogoIntegracoes.map((i) => i.nome.toLowerCase()));
    return (item?.ferramentas ?? []).filter((f) => catalogNames.has(f.toLowerCase()));
  })();
  const showIntegracoes = integracaoNomes.length > 0;
  const showResultados = !meta?.semMetricas && (item?.resultados?.length ?? 0) > 0;

  if (!item) {
    if (!hydrated) return <ContentPending />;
    throw notFound();
  }

  const caseTone = contrastOnBackground(item.cor);

  const excluirDoPortal = () => {
    Modal.confirm({
      title: "Excluir do portal?",
      content: (
        <>
          O case <strong>{item.nome}</strong> sai do banco e da interface. A página no Confluence
          não será removida.
        </>
      ),
      okText: "Excluir do portal",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteCase(item.id);
          toast.success("Case excluído do portal", {
            description: "A página no Confluence foi mantida.",
          });
          navigate({ to: "/cases" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Falha ao excluir o case.");
          throw error;
        }
      },
    });
  };

  const epicKey = meta?.jiraEpicKey;
  const responsavel = responsavelDoCase(item);
  const atualizacoes = meta?.atualizacoes ?? [];

  const atualizarDoJira = () => {
    if (!epicKey) {
      toast.error("Este case não foi importado do Jira, então não há épico para atualizar.");
      return;
    }
    setAtualizando(true);
    void (async () => {
      try {
        const result = await importCaseFromJira({
          projectUrl: epicKey,
          availableIntegrations: catalogoIntegracoes.map((i) => i.nome),
        });
        const d = result.draft;
        const resultados = (d.resultados ?? [])
          .filter((r) => /\d/.test(r.valor ?? ""))
          .map((r) => ({
            label: r.label || "Métrica",
            valor: r.valor || "—",
            ...(r.detalhe ? { detalhe: r.detalhe } : {}),
          }));
        const agora = new Date().toISOString();
        await saveCustomCase(
          {
            ...item,
            descricao: d.descricao || item.descricao,
            problema: d.problema || item.problema,
            solucao: d.solucao || item.solucao,
            ...(d.etapaAtual ? { etapaAtual: d.etapaAtual } : {}),
            ...(d.statusAtual ? { statusAtual: d.statusAtual } : {}),
            ...(d.etapaSeguinte ? { etapaSeguinte: d.etapaSeguinte } : {}),
            antes: d.antes?.filter(Boolean).length ? d.antes.filter(Boolean) : item.antes,
            depois: d.depois?.filter(Boolean).length ? d.depois.filter(Boolean) : item.depois,
            resultados: resultados.length ? resultados : item.resultados,
            ...(d.responsavel ? { responsavel: d.responsavel } : {}),
            ...(d.jiraStatus ? { jiraStatus: d.jiraStatus } : {}),
            updatedAt: agora,
          },
          {
            dores: d.dores?.filter(Boolean).length ? d.dores.filter(Boolean) : dores,
            galeria: (d.galeria ?? [])
              .filter((g) => g.url)
              .map((g, i) => ({
                id: `${item.id}-g${i + 1}`,
                titulo: g.titulo || `Mídia ${i + 1}`,
                descricao: "",
                url: g.url,
                ...(g.mimeType ? { mimeType: g.mimeType } : {}),
              })),
            integracoes: meta?.integracoes ?? integracaoNomes,
            ...(meta?.semIntegracoes ? { semIntegracoes: true } : {}),
            semMetricas: resultados.length === 0,
            jiraEpicKey: epicKey,
            atualizacoes: [
              {
                data: agora,
                resumo: d.resumoAtualizacao || d.statusAtual || "Dados atualizados a partir do Jira.",
              },
              ...atualizacoes,
            ].slice(0, 20),
          },
        );
        refresh();
        const metaAtualizada = lerCaseMeta(item.id);
        const itemAtualizado = { ...item, ...(d.responsavel ? { responsavel: d.responsavel } : {}) };
        if (metaAtualizada) {
          try {
            const sync = await syncCaseToConfluence(itemAtualizado, metaAtualizada);
            if (sync.ok) toast.success(sync.message);
            else toast.warning(sync.message);
          } catch (confluenceError) {
            toast.warning(
              confluenceError instanceof Error
                ? `Confluence: ${confluenceError.message}`
                : "Não foi possível sincronizar com o Confluence.",
            );
          }
        }
        toast.success("Case atualizado com o Jira", {
          description: `${result.meta.issuesCount ?? 0} issues e ${result.meta.attachmentsCount ?? 0} mídias reprocessadas.`,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao atualizar do Jira.");
      } finally {
        setAtualizando(false);
      }
    })();
  };

  const origem = de === "home" ? null : (origens[de ?? "cases"] ?? origens["cases"]!);

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/portal" },
        ...(origem ? [origem] : []),
        { label: item.nome },
      ]}
    >
      <div
        className="relative mb-8 overflow-hidden rounded-2xl p-8 shadow-[0_12px_36px_-8px_rgba(37,48,44,0.42),0_32px_72px_-18px_rgba(37,48,44,0.36)] sm:p-12"
        style={{ backgroundColor: item.cor, color: caseTone.text }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 15%, ${caseTone.glow} 0, transparent 45%), radial-gradient(circle at 90% 80%, ${caseTone.glow} 0, transparent 40%)`,
          }}
          aria-hidden
        />
        <div className="relative">
          <LoftMark
            backgroundColor={item.cor}
            className="mb-5 h-10 drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:h-12"
          />
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] backdrop-blur-sm"
            style={{
              borderColor: caseTone.chipBorder,
              backgroundColor: caseTone.chipBg,
              color: caseTone.muted,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: caseTone.text }}
            />
            {item.area}
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-3xl font-semibold sm:text-4xl">
            {item.nome}
          </h1>
          <p
            className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed sm:text-base"
            style={{ color: caseTone.muted }}
          >
            {item.descricao}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <Card
            className="card-sheen overflow-hidden shadow-card"
            styles={{ body: { padding: 0 } }}
          >
            <div className="flex flex-col gap-5 bg-secondary/40 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Área:
                </p>
                <h2 className="text-pretty text-xl font-semibold sm:text-2xl">{item.area}</h2>
              </div>
              <Link to="/mapa" search={{ area: item.area }}>
                <Button type="default" icon={<TeamOutlined />} className="shrink-0">
                  Ver área no AI Map
                </Button>
              </Link>
            </div>
          </Card>

          <Bloco icone={AimOutlined} titulo="Problema">
            <p className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
              {item.problema}
            </p>
          </Bloco>

          <Bloco icone={WarningOutlined} titulo="Principais dores">
            <Card
              className="shadow-card"
              classNames={{ body: "p-5 sm:p-6" }}
            >
              <ul className="space-y-3">
                {dores.map((d) => (
                  <li key={d} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Bloco>

          <Bloco icone={BulbOutlined} titulo="Solução">
            <p className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
              {item.solucao}
            </p>
          </Bloco>

          {item.etapaAtual?.trim() ? (
            <Bloco icone={RocketOutlined} titulo="Etapa atual">
              <p className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                {item.etapaAtual}
              </p>
            </Bloco>
          ) : null}

          {item.statusAtual?.trim() ? (
            <Bloco icone={LineChartOutlined} titulo="Status atual">
              <Card
                className="shadow-card"
                classNames={{ body: "p-5 sm:p-6" }}
              >
                <p className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                  {item.statusAtual}
                </p>
                {atualizacoes.length ? (
                  <div className="mt-5 border-t border-border/70 pt-4">
                    <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Histórico de atualizações
                    </p>
                    <ul className="space-y-3">
                      {atualizacoes.slice(0, 6).map((a) => (
                        <li key={a.data} className="text-sm">
                          <span className="font-mono text-[11px] text-primary">
                            {new Date(a.data).toLocaleDateString("pt-BR")}
                          </span>
                          <p className="mt-1 leading-relaxed text-muted-foreground">{a.resumo}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            </Bloco>
          ) : null}

          {item.etapaSeguinte?.trim() ? (
            <Bloco icone={ArrowRightOutlined} titulo="Etapa seguinte">
              <p className="whitespace-pre-line text-pretty leading-relaxed text-muted-foreground">
                {item.etapaSeguinte}
              </p>
            </Bloco>
          ) : null}

          {showIntegracoes && (
          <Bloco icone={ApiOutlined} titulo="Integrações">
            <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Sistemas conectados a esta solução. Cada card abre o detalhe da integração.
            </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {integracaoNomes.map((nome) => {
                  const detalhe = resolveIntegracao(nome, catalogoIntegracoes);
                  const logo =
                    (detalhe ? resolveLogo(detalhe.id, detalhe.nome) : undefined) ??
                    resolveLogo(nome) ??
                    integracaoLogoPorNome(nome);
                  const inner = (
                    <>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-card p-2 shadow-sm">
                        {logo ? (
                          <img src={logo} alt="" className="h-7 w-7 object-contain" />
                        ) : (
                          <ApiOutlined className="text-lg text-primary" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{detalhe?.nome ?? nome}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                          {detalhe?.descricao ?? "Integração utilizada neste case."}
                        </span>
                        {detalhe && (
                          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {detalhe.categoria}
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <Card
                      key={nome}
                      className="card-sheen shadow-card transition-shadow hover:shadow-lift"
                      styles={{ body: { padding: 0 } }}
                    >
                      <div className="flex gap-4 p-5">{inner}</div>
                    </Card>
                  );
                })}
              </div>
          </Bloco>
          )}

          <Bloco icone={SwapOutlined} titulo="Antes x Depois">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card
                className="shadow-card"
                classNames={{ body: "p-5" }}
              >
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Antes
                </p>
                <ul className="space-y-2.5">
                  {item.antes.map((a) => (
                    <li key={a} className="flex gap-2.5 text-sm text-muted-foreground">
                      <CloseOutlined className="mt-0.5 shrink-0 text-destructive/70" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card
                className="border-accent/30 bg-accent/5 shadow-card"
                classNames={{ body: "p-5" }}
              >
                <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent">
                  Depois
                </p>
                <ul className="space-y-2.5">
                  {item.depois.map((d) => (
                    <li key={d} className="flex gap-2.5 text-sm">
                      <CheckOutlined className="mt-0.5 shrink-0 text-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </Bloco>

          {showResultados && (
          <Bloco icone={BarChartOutlined} titulo="Resultados">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {item.resultados.map((r) => (
                <Card
                  key={r.label}
                  className="shadow-card"
                  classNames={{ body: "flex flex-col p-5" }}
                >
                  <p className="font-display text-2xl font-semibold tracking-tight">{r.valor}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
                  {r.detalhe?.trim() ? (
                    <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-foreground/80">
                      {r.detalhe}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
          </Bloco>
          )}

          <Bloco icone={PictureOutlined} titulo="Galeria">
            <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Prints e vídeos da solução em uso. Clique para ampliar ou reproduzir.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {galeria.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setAberto(p)}
                  className={`card-sheen group relative overflow-hidden rounded-2xl border bg-card text-left shadow-card transition-all hover:-translate-y-0.5 ${
                    i === 0 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                    {isVideoMedia(p.url, p.mimeType) ? (
                      <video
                        src={resolveApiAssetUrl(p.url)}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <img
                        src={resolveApiAssetUrl(p.url)}
                        alt={`${p.titulo} — ${item.nome}`}
                        width={1280}
                        height={800}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 opacity-0 shadow-card transition-opacity group-hover:opacity-100">
                      <ExpandOutlined className="text-sm" />
                    </span>
                  </div>
                  <div className="border-t border-border/70 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      {isVideoMedia(p.url, p.mimeType) ? "Vídeo" : "Print"}{" "}
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{p.titulo}</p>
                  </div>
                </button>
              ))}
            </div>
          </Bloco>

          <GaleriaLightbox
            print={
              aberto
                ? { ...aberto, descricao: "" }
                : null
            }
            alt={aberto ? aberto.titulo : ""}
            onClose={() => setAberto(null)}
            onPrev={() => {
              const i = galeria.findIndex((g) => g.id === aberto?.id);
              setAberto(galeria[(i - 1 + galeria.length) % galeria.length] ?? null);
            }}
            onNext={() => {
              const i = galeria.findIndex((g) => g.id === aberto?.id);
              setAberto(galeria[(i + 1) % galeria.length] ?? null);
            }}
          />
        </div>

        <aside>
          <Card
            className="shadow-card lg:sticky lg:top-20"
            classNames={{ body: "space-y-4 p-5" }}
          >
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <StatusBadge status={item.status} />
            </div>
            <Divider className="!my-0" />
            {responsavel ? (
              <>
                <div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Responsável
                  </p>
                  <div className="flex items-center gap-2.5">
                    <ResponsavelAvatar
                      nome={responsavel.nome}
                      avatarUrl={responsavel.avatarUrl}
                      className="h-9 w-9 text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{responsavel.nome}</p>
                      {responsavel.email ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {responsavel.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Divider className="!my-0" />
              </>
            ) : null}
            <div>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Área
              </p>
              <p className="text-sm">{item.area}</p>
            </div>
            {showIntegracoes && (
              <>
                <Divider className="!my-0" />
                <div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Integrações
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {integracaoNomes.map((f) => {
                      const detalhe = resolveIntegracao(f, catalogoIntegracoes);
                      const logo =
                        (detalhe ? resolveLogo(detalhe.id, detalhe.nome) : undefined) ??
                        resolveLogo(f) ??
                        integracaoLogoPorNome(f);
                      return (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-xs"
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
            <Divider className="!my-0" />
            {epicKey ? (
              <div className="space-y-2">
                <Button
                  type="default"
                  size="small"
                  block
                  icon={<ReloadOutlined spin={atualizando} />}
                  onClick={atualizarDoJira}
                  disabled={atualizando}
                >
                  {atualizando ? "Atualizando…" : "Atualizar do Jira"}
                </Button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Reprocessa o épico {epicKey} com as novas histórias, subtasks, comentários e
                  anexos.
                  {item.updatedAt
                    ? ` Última atualização em ${new Date(item.updatedAt).toLocaleDateString("pt-BR")}.`
                    : ""}
                </p>
              </div>
            ) : null}
            <Link
              to="/admin/adicionar-case"
              search={{ edit: item.id }}
              className="block w-full"
            >
              <Button type="primary" size="small" block icon={<EditOutlined />}>
                Editar case
              </Button>
            </Link>
            <Link to="/mapa" search={{ area: item.area }} className="block w-full">
              <Button type="default" size="small" block>
                Ver área no AI Map
              </Button>
            </Link>
            <div className="space-y-2">
              <Button
                type="default"
                size="small"
                danger
                block
                icon={<DeleteOutlined />}
                onClick={excluirDoPortal}
              >
                Excluir do portal
              </Button>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Remove o case do banco e da interface. Não apaga a página no Confluence.
              </p>
            </div>
          </Card>
        </aside>
      </div>
      <JiraImportLoading open={atualizando} done={false} />
    </PageShell>
  );
}
