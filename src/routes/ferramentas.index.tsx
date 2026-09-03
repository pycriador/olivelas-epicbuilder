import {
  ApiOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  PictureOutlined,
  PlusOutlined,
  SearchOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Modal } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { SegmentedTabs } from "@/components/portal/SegmentedTabs";
import { integracaoLogoPorNome, integracaoLogos } from "@/data/logos";
import { usePortalContent } from "@/hooks/use-portal-content";
import { saveCustomIntegracao, slugify } from "@/lib/content-store";
import { removeLogoBackground } from "@/lib/remove-logo-bg";

const { TextArea } = Input;

export const Route = createFileRoute("/ferramentas/")({
  head: () => ({
    meta: [
      { title: "Integrações — AIOps App Model" },
      {
        name: "description",
        content:
          "Sistemas já conectados às soluções de IA da Loft: Jira, Confluence, Slack, Metabase e mais.",
      },
      { property: "og:title", content: "Integrações já realizadas — AIOps App Model" },
      {
        property: "og:description",
        content: "Veja quais sistemas os times já conectaram às automações de IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntegracoesPage,
});

type Aba = "todas" | "adicionar";

function IntegracoesPage() {
  const [aba, setAba] = useState<Aba>("todas");
  const [busca, setBusca] = useState("");
  const { integracoes, logos } = usePortalContent();

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return integracoes;
    return integracoes.filter((i) =>
      [i.nome, i.descricao, i.categoria, ...i.tags].join(" ").toLowerCase().includes(q),
    );
  }, [busca, integracoes]);

  return (
    <PageShell
      maxLargura="max-w-[1400px]"
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Integrações" }]}
      eyebrow="Sistemas conectados"
      titulo="Integrações já realizadas"
      descricao="Os sistemas que os times já conectaram às soluções de IA, com quando usar e exemplos reais."
    >
      <SegmentedTabs
        straddle
        valor={aba}
        onChange={setAba}
        itens={[
          { value: "todas", label: "Todas as integrações", count: integracoes.length },
          { value: "adicionar", label: "Adicionar" },
        ]}
      />

      {aba === "todas" ? (
        <>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar integração..."
            size="large"
            className="mb-6 max-w-md rounded-xl"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((f) => {
              const logo = logos[f.id] ?? integracaoLogos[f.id] ?? integracaoLogoPorNome(f.nome);
              return (
                <Card
                  key={f.id}
                  className="group shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/35 hover:shadow-lift"
                  styles={{ body: { padding: 0 } }}
                >
                  <Link to="/ferramentas/$id" params={{ id: f.id }} className="block p-5">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border bg-card p-2">
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
                        <ApiOutlined className="text-lg text-primary" />
                      )}
                    </span>
                    <h2 className="mt-3 text-base font-semibold">{f.nome}</h2>
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
        </>
      ) : (
        <NovaIntegracaoForm onSalvo={() => setAba("todas")} />
      )}
    </PageShell>
  );
}

function NovaIntegracaoForm({ onSalvo }: { onSalvo: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [catAberto, setCatAberto] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const escolherLogo = async (file: File | undefined) => {
    if (!file) return;
    setProcessando(true);
    try {
      setLogo(await removeLogoBackground(file));
      toast.success("Logo processado — fundo removido automaticamente.");
    } catch {
      toast.error("Não consegui processar esse arquivo. Tente um PNG ou JPG.");
    } finally {
      setProcessando(false);
    }
  };

  const salvar = async () => {
    if (!nome.trim()) {
      toast.error("Informe o nome da integração.");
      return;
    }
    setSalvando(true);
    try {
      const id = slugify(nome);
      await saveCustomIntegracao(
        {
          id,
          nome: nome.trim(),
          descricao: descricao.trim() || "Integração adicionada pelo time.",
          paraQue: descricao.trim() || "Conectar este sistema às soluções de IA.",
          nivel: "Iniciante",
          status: "Ativa",
          categoria: categorias[0]?.trim() || "Outros",
          quandoUsar: [],
          quandoNaoUsar: [],
          exemplos: [],
          tutoriais: [],
          casesRelacionados: [],
          tags: [nome.trim().toLowerCase(), ...categorias.map((c) => c.toLowerCase())],
        },
        logo ?? undefined,
      );
      toast.success("Integração adicionada.");
      onSalvo();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card className="max-w-2xl shadow-card" styles={{ body: { padding: 24 } }}>
      <h2 className="text-base font-semibold">Adicionar integração</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Envie o logo do sistema — o fundo é removido automaticamente.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-dashed border-border bg-secondary/40">
          {processando ? (
            <LoadingOutlined className="text-lg text-muted-foreground" />
          ) : logo ? (
            <img src={logo} alt="" className="h-11 w-11 object-contain" />
          ) : (
            <PictureOutlined className="text-lg text-muted-foreground" />
          )}
        </span>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void escolherLogo(e.target.files?.[0])}
          />
          <Button type="default" onClick={() => inputRef.current?.click()}>
            Enviar logo
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG ou SVG rasterizado.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da integração"
          size="large"
          className="rounded-xl"
        />
        <button
          type="button"
          onClick={() => setCatAberto(true)}
          className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm transition-colors hover:border-primary/50"
        >
          <TagOutlined className="shrink-0 text-muted-foreground" />
          {categorias.length ? (
            <span className="min-w-0 truncate">{categorias.join(", ")}</span>
          ) : (
            <span className="text-muted-foreground">Categorias</span>
          )}
        </button>
      </div>
      {categorias.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {categorias.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {c}
              <button
                type="button"
                aria-label={`Remover ${c}`}
                onClick={() => setCategorias((prev) => prev.filter((x) => x !== c))}
              >
                <CloseOutlined className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <CategoriaPicker
        aberto={catAberto}
        onOpenChange={setCatAberto}
        selecionadas={categorias}
        onChange={setCategorias}
      />
      <TextArea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição curta"
        className="mt-3 rounded-xl"
        autoSize={{ minRows: 3 }}
      />

      <Button type="primary" className="mt-5" onClick={() => void salvar()} loading={salvando}>
        {salvando ? "Salvando…" : "Adicionar integração"}
      </Button>
    </Card>
  );
}

const CATEGORIAS_SUGERIDAS = [
  "Comunicação",
  "Gestão de projetos",
  "Documentação",
  "Dados & BI",
  "Automação",
  "Atendimento",
  "Desenvolvimento",
  "IA & LLM",
  "Financeiro",
  "CRM",
];

function CategoriaPicker({
  aberto,
  onOpenChange,
  selecionadas,
  onChange,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  selecionadas: string[];
  onChange: (v: string[]) => void;
}) {
  const { integracoes } = usePortalContent();
  const [busca, setBusca] = useState("");
  const [criadas, setCriadas] = useState<string[]>([]);

  const todas = useMemo(() => {
    const set = new Set<string>([
      ...CATEGORIAS_SUGERIDAS,
      ...integracoes.map((i) => i.categoria).filter(Boolean),
      ...criadas,
      ...selecionadas,
    ]);
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  }, [integracoes, criadas, selecionadas]);

  const q = busca.trim();
  const filtradas = todas.filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  const podeCriar = q.length > 1 && !todas.some((c) => c.toLowerCase() === q.toLowerCase());

  const alternar = (c: string) =>
    onChange(selecionadas.includes(c) ? selecionadas.filter((x) => x !== c) : [...selecionadas, c]);

  const criar = () => {
    setCriadas((prev) => [...prev, q]);
    onChange([...selecionadas, q]);
    setBusca("");
  };

  return (
    <Modal
      open={aberto}
      onCancel={() => onOpenChange(false)}
      title="Categorias"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {selecionadas.length} selecionada{selecionadas.length === 1 ? "" : "s"}
          </span>
          <Button type="primary" onClick={() => onOpenChange(false)}>
            Concluir
          </Button>
        </div>
      }
      destroyOnHidden
      width={512}
      styles={{ body: { paddingTop: 8 } }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Escolha uma ou mais categorias — ou crie uma nova na hora.
      </p>

      <Input
        autoFocus
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar categoria..."
        size="large"
        prefix={<SearchOutlined className="text-muted-foreground" />}
        className="rounded-xl"
      />

      <div className="mt-4 max-h-72 space-y-1.5 overflow-y-auto">
        {podeCriar ? (
          <button
            type="button"
            onClick={criar}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <PlusOutlined />
            Criar “{q}”
          </button>
        ) : null}

        {filtradas.map((c) => {
          const ativa = selecionadas.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => alternar(c)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                ativa
                  ? "border-primary/40 bg-primary/10 font-medium text-primary"
                  : "border-transparent hover:bg-secondary"
              }`}
            >
              {c}
              {ativa ? <CheckOutlined /> : null}
            </button>
          );
        })}

        {!filtradas.length && !podeCriar ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria encontrada.
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
