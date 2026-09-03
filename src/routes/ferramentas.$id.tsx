import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { integracaoLogoPorNome } from "@/data/logos";
import { usePortalContent } from "@/hooks/use-portal-content";

export const Route = createFileRoute("/ferramentas/$id")({
  head: () => ({
    meta: [
      { title: "Integração — AIOps App Model" },
      { name: "description", content: "Integração conectada às soluções de IA da Loft." },
      { property: "og:title", content: "Integração — AIOps App Model" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntegracaoDetalhe,
});

function Lista({
  titulo,
  itens,
  positivo,
}: {
  titulo: string;
  itens: string[];
  positivo?: boolean;
}) {
  if (!itens.length) return null;
  const Icon = positivo ? CheckCircleOutlined : CloseCircleOutlined;
  return (
    <Card className="shadow-card" styles={{ body: { padding: 20 } }}>
      <h2 className="text-base font-semibold">{titulo}</h2>
      <ul className="mt-3 space-y-2">
        {itens.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <Icon
              className={`mt-0.5 shrink-0 ${positivo ? "text-accent" : "text-destructive"}`}
            />
            {i}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function IntegracaoDetalhe() {
  const { id } = Route.useParams();
  const { getIntegracao, logoDaIntegracao, hydrated } = usePortalContent();
  const item = getIntegracao(id);

  if (!item) {
    if (!hydrated) {
      return (
        <PageShell
          crumbs={[{ label: "Home", to: "/portal" }, { label: "Integrações", to: "/ferramentas" }]}
          titulo="Carregando…"
        >
          <div className="h-40 animate-pulse rounded-2xl bg-secondary" />
        </PageShell>
      );
    }
    throw notFound();
  }

  const logo = logoDaIntegracao(item.id) ?? integracaoLogoPorNome(item.nome);

  return (
    <PageShell
      maxLargura="max-w-[1100px]"
      crumbs={[
        { label: "Home", to: "/portal" },
        { label: "Integrações", to: "/ferramentas" },
        { label: item.nome },
      ]}
      eyebrow={item.categoria}
      titulo={item.nome}
      descricao={item.descricao}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-card" styles={{ body: { padding: 20 } }}>
            <h2 className="text-base font-semibold">Para que serve</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.paraQue}</p>
          </Card>

          <Lista titulo="Quando usar" itens={item.quandoUsar} positivo />
          <Lista titulo="Quando não usar" itens={item.quandoNaoUsar} />

          {item.exemplos.length > 0 && (
            <Card className="shadow-card" styles={{ body: { padding: 20 } }}>
              <h2 className="text-base font-semibold">Exemplos na Loft</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {item.exemplos.map((e) => (
                  <li key={e}>• {e}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="shadow-card" styles={{ body: { padding: 20 } }}>
            <div className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                  <ApiOutlined className="text-lg text-muted-foreground" />
                </span>
              )}
              <div>
                <p className="text-sm font-semibold">{item.nome}</p>
                <p className="text-xs text-muted-foreground">{item.status}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Nível: {item.nivel}</p>
          </Card>

          {item.casesRelacionados.length > 0 && (
            <Card className="shadow-card" styles={{ body: { padding: 20 } }}>
              <h2 className="text-base font-semibold">Cases relacionados</h2>
              <ul className="mt-3 space-y-2">
                {item.casesRelacionados.map((caseId) => (
                  <li key={caseId}>
                    <Link
                      to="/cases/$id"
                      params={{ id: caseId }}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver case
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
