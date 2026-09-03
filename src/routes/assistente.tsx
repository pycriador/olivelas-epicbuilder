import {
  ApartmentOutlined,
  BookOutlined,
  ExportOutlined,
  ExperimentOutlined,
  SendOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Input } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { search, type SearchResult } from "@/lib/search";

export const Route = createFileRoute("/assistente")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Assistente de IA interno — AIOps App Model" },
      {
        name: "description",
        content:
          "Pergunte sobre cases, ferramentas, aulas e templates de IA da Loft e receba respostas com links para o conteúdo interno.",
      },
      { property: "og:title", content: "Assistente de IA — Loft" },
      {
        property: "og:description",
        content: "Um copiloto que responde com base no conteúdo do portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistentePage,
});

interface Msg {
  id: number;
  autor: "user" | "ia";
  texto: string;
  fontes?: SearchResult[];
}

const sugestoes: {
  icon: ComponentType<{ className?: string }>;
  texto: string;
  tag: string;
}[] = [
  {
    icon: ApartmentOutlined,
    texto: "Como automatizar a análise de feedback de clientes?",
    tag: "Automação",
  },
  {
    icon: ExperimentOutlined,
    texto: "Qual ferramenta usar para criar um agente interno?",
    tag: "Ferramentas",
  },
  {
    icon: BookOutlined,
    texto: "Quero aprender a escrever prompts melhores",
    tag: "Academy",
  },
];

function responder(pergunta: string): Msg {
  const fontes = search(pergunta, 4);
  const texto = fontes.length
    ? `Encontrei conteúdo do portal que responde isso.\n\nPelo que você descreveu, o caminho mais curto é olhar “${fontes[0]!.titulo}” — ${fontes[0]!.descricao}\n\nSe fizer sentido, dá para reaproveitar boa parte do que já existe em vez de começar do zero. Veja as referências abaixo.`
    : "Ainda não tenho conteúdo interno sobre isso no portal. Descreva o processo com mais detalhes (o que você faz hoje, com que frequência e qual o resultado esperado) ou registre a ideia na página “Quero automatizar algo”.";
  return { id: Date.now(), autor: "ia", texto, fontes };
}

function AssistentePage() {
  const { q } = Route.useSearch();
  const [mensagens, setMensagens] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const ultimaQ = useRef<string | null>(null);

  const enviar = (valor: string) => {
    const pergunta = valor.trim();
    if (!pergunta) return;
    seq.current += 1;
    const id = seq.current;
    setMensagens((m) => [...m, { id, autor: "user", texto: pergunta }]);
    setTexto("");
    setPensando(true);
    setTimeout(() => {
      seq.current += 1;
      setMensagens((m) => [...m, { ...responder(pergunta), id: seq.current }]);
      setPensando(false);
    }, 320);
  };

  useEffect(() => {
    if (!q || ultimaQ.current === q) return;
    ultimaQ.current = q;
    enviar(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando]);

  return (
    <PageShell
      crumbs={[{ label: "Home", to: "/portal" }, { label: "Assistente" }]}
      eyebrow="Copiloto interno"
      titulo="Assistente de IA"
      descricao="Pergunte em linguagem natural. As respostas são construídas a partir do conteúdo deste portal."
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {/* header */}
          <div
            className="relative shrink-0 overflow-hidden border-b border-border px-5 py-5 sm:px-7"
            style={{ background: "oklch(0.40 0.10 162)", color: "oklch(0.98 0.005 160)" }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 18% 20%, oklch(1 0 0 / 0.18) 0, transparent 45%), radial-gradient(circle at 88% 75%, oklch(1 0 0 / 0.12) 0, transparent 40%)",
              }}
              aria-hidden
            />
            <div className="relative flex items-center gap-3.5">
              <span className="relative grid h-12 w-12 place-items-center rounded-xl border border-white/30 bg-white/15 text-white shadow-card backdrop-blur-sm">
                <ThunderboltOutlined className="text-lg" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-white">
                  AI Assistant
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/75">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
                    <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                  conectado ao portal
                </p>
              </div>
              <span className="ml-auto hidden rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm sm:inline-block">
                Beta interno
              </span>
            </div>
          </div>


          <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-secondary/40 to-card">
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-7">
              {mensagens.length === 0 && !pensando && (
                <div className="grid gap-6 py-8">
                  <div className="text-center">
                    <h2 className="text-balance font-display text-2xl font-semibold sm:text-3xl">
                      O que você quer descobrir sobre IA na Loft?
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                      Comece com uma dessas perguntas ou escreva a sua.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {sugestoes.map((s) => (
                      <button
                        key={s.texto}
                        onClick={() => enviar(s.texto)}
                        className="group card-sheen grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <s.icon />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {s.tag}
                          </span>
                          <span className="block truncate text-sm font-medium">{s.texto}</span>
                        </span>
                        <ExportOutlined className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mensagens.map((m) => (
                <div
                  key={m.id}
                  className={`animate-rise-in flex gap-3 ${
                    m.autor === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                      m.autor === "ia"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {m.autor === "ia" ? <ThunderboltOutlined /> : <UserOutlined />}
                  </span>
                  <div className={`min-w-0 max-w-[85%] ${m.autor === "user" ? "text-right" : ""}`}>
                    <p
                      className={`inline-block whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-sm leading-relaxed shadow-card ${
                        m.autor === "ia"
                          ? "rounded-tl-sm border border-border bg-card"
                          : "rounded-tr-sm bg-primary text-primary-foreground"
                      }`}
                    >
                      {m.texto}
                    </p>
                    {m.fontes && m.fontes.length > 0 && (
                      <div className="mt-3 grid gap-2 text-left">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Fontes no portal
                        </p>
                        {m.fontes.map((f) => (
                          <Link
                            key={`${f.kind}-${f.id}`}
                            to={f.href}
                            params={f.params as never}
                            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{f.titulo}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {f.meta}
                              </span>
                            </span>
                            <ExportOutlined className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {pensando && (
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <ThunderboltOutlined />
                  </span>
                  <span className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </span>
                </div>
              )}
              <div ref={fim} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar(texto);
              }}
              className="shrink-0 border-t border-border/60 bg-card/90 p-4 backdrop-blur-md"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-full border border-border/70 bg-card p-1.5 shadow-card transition-colors focus-within:border-primary/50">
                <Input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Pergunte sobre IA na Loft..."
                  variant="borderless"
                  className="h-10 px-4"
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  className="h-10 rounded-full px-4"
                  disabled={!texto.trim()}
                >
                  <span className="hidden sm:inline">Enviar</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
