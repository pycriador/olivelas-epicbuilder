import { SearchOutlined } from "@ant-design/icons";
import { Card, Input } from "antd";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { groupResults, kindLabel, search, type ResultKind } from "@/lib/search";

export const Route = createFileRoute("/busca")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Busca no AIOps App Model — Loft" },
      {
        name: "description",
        content:
          "Busque cases, aulas, ferramentas, templates e prompts de IA em um único lugar dentro do AIOps App Model da Loft.",
      },
      { property: "og:title", content: "Busca — AIOps App Model" },
      { property: "og:description", content: "Encontre tudo sobre IA na Loft em uma busca." },
    ],
  }),
  component: BuscaPage,
});

function BuscaPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const resultados = search(q, 60);
  const grupos = groupResults(resultados);

  return (
    <PageShell
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Busca" }]}
      eyebrow="Busca global"
      titulo={q ? `Resultados para “${q}”` : "Busca"}
      descricao={
        q
          ? `${resultados.length} ${resultados.length === 1 ? "resultado encontrado" : "resultados encontrados"} em cases, aulas, ferramentas, templates e prompts.`
          : "Procure por um problema, ferramenta ou assunto."
      }
    >
      <div className="mb-10 max-w-xl">
        <Input
          defaultValue={q}
          autoFocus
          prefix={<SearchOutlined className="text-muted-foreground" />}
          placeholder="Ex: automatizar relatório, agente, feedback de cliente..."
          onChange={(e) => navigate({ to: "/busca", search: { q: e.target.value } })}
        />
      </div>

      {q.length >= 2 && resultados.length === 0 && (
        <Card className="shadow-card" styles={{ body: { padding: 32, textAlign: "center" } }}>
          <p className="text-sm text-muted-foreground">Nada encontrado. Tente outro termo.</p>
        </Card>
      )}

      <div className="space-y-10">
        {(Object.keys(grupos) as ResultKind[]).map((kind) => (
          <section key={kind}>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {kindLabel[kind]} · {grupos[kind]!.length}
            </h2>
            <div className="grid gap-3">
              {grupos[kind]!.map((r) => (
                <Card
                  key={`${r.kind}-${r.id}`}
                  className="card-hover shadow-card"
                  styles={{ body: { padding: 0 } }}
                  size="small"
                >
                  <Link to={r.href} params={r.params as never} className="block p-4">
                    <span className="block truncate text-sm font-medium">{r.titulo}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{r.descricao}</span>
                    <span className="mt-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {r.meta}
                    </span>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
