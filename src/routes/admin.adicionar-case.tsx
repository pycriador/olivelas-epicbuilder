import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AimOutlined,
  ApiOutlined,
  BarChartOutlined,
  BulbOutlined,
  PictureOutlined,
  PlusOutlined,
  ProjectOutlined,
  RocketOutlined,
  SaveOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Modal, Tabs } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AdminFormSection,
  AdminSplitLayout,
  Field,
  ListEditor,
} from "@/components/admin/AdminForm";
import { AdminCatalogActionsDialog } from "@/components/admin/AdminCatalogActionsDialog";
import { AreaPicker } from "@/components/admin/AreaPicker";
import {
  CaseLivePreview,
  type CaseDraft,
  type GaleriaItem,
} from "@/components/admin/CaseLivePreview";
import { IntegrationReview } from "@/components/admin/IntegrationReview";
import { JiraImportLoading } from "@/components/admin/JiraImportLoading";
import { JiraImportPanel } from "@/components/admin/JiraImportPanel";
import { StyledSelect } from "@/components/admin/StyledSelect";
import { PageShell } from "@/components/layout/PageShell";
import { CaseCard } from "@/components/portal/CaseCard";
import { ResponsavelAvatar } from "@/components/portal/ResponsavelAvatar";
import type { CaseItem, Status } from "@/data/types";
import { LOFT_COLOR_OPTIONS } from "@/data/loft-colors";
import { usePortalContent } from "@/hooks/use-portal-content";
import { deleteCase, getCaseMeta, saveCustomCase, slugify } from "@/lib/content-store";
import { syncCaseToConfluence } from "@/lib/confluence-sync";
import { groupGaleriaByOrigem } from "@/lib/galeria-origem";

const { TextArea } = Input;

export const Route = createFileRoute("/admin/adicionar-case")({
  validateSearch: (search: Record<string, unknown>): { edit?: string } =>
    typeof search["edit"] === "string" && search["edit"]
      ? { edit: search["edit"] as string }
      : {},
  head: () => ({
    meta: [
      { title: "Adicionar Projeto — Administração | Olivelas" },
      {
        name: "description",
        content: "Cadastre um novo case de IA no mesmo padrão da página Projetos.",
      },
    ],
  }),
  component: AdicionarCasePage,
});

const STATUS: Status[] = ["Em produção", "Piloto", "Em desenvolvimento", "Experimento"];

function GaleriaImportSummary({
  galeria,
  epicKey,
}: {
  galeria: GaleriaItem[];
  epicKey?: string;
}) {
  const midias = galeria.filter((g) => g.url.trim());
  const groups = groupGaleriaByOrigem(midias, epicKey);
  const videos = midias.filter((g) =>
    (g.mimeType ?? "").startsWith("video/") || g.url.startsWith("data:video/"),
  ).length;
  const imagens = midias.length - videos;

  const resumo =
    videos > 0 && imagens > 0
      ? `${midias.length} mídias importadas do Jira (${imagens} ${imagens === 1 ? "imagem" : "imagens"}, ${videos} ${videos === 1 ? "vídeo" : "vídeos"})`
      : videos > 0
        ? `${videos} ${videos === 1 ? "vídeo importado" : "vídeos importados"} do Jira`
        : `${imagens} ${imagens === 1 ? "imagem importada" : "imagens importadas"} do Jira`;

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="border-b border-border/60 bg-secondary/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{resumo}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Agrupadas pela issue de origem no épico
        </p>
      </div>

      {groups.length ? (
        <ul className="divide-y divide-border/60">
          {groups.map((g) => (
            <li
              key={g.key}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                    {g.typeLabel}
                  </span>
                  <span className="font-mono text-xs font-semibold tracking-wide text-primary">
                    {g.issueKey}
                  </span>
                </div>
                <p className="text-sm leading-snug text-foreground/90 break-words">{g.summary}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
                {g.count} {g.count === 1 ? "img" : "imgs"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          Reimporte o épico para carregar de qual issue cada print veio.
        </p>
      )}

      <div className="border-t border-border/60 bg-secondary/20 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          Para renomear ou excluir imagens, use a pré-visualização à direita.
        </p>
      </div>
    </div>
  );
}

function isGaleriaImportada(form: CaseDraft) {
  if (form.galeriaImportada) return true;
  return form.galeria.some(
    (g) =>
      Boolean(g.url.trim()) &&
      (Boolean(g.origem?.issueKey) || g.url.startsWith("data:image")),
  );
}

const emptyForm: CaseDraft = {
  nome: "",
  descricao: "",
  area: "Produto",
  status: "Piloto",
  impacto: "Médio",
  cor: "#115644",
  problema: "",
  dores: [""],
  solucao: "",
  etapaAtual: "",
  statusAtual: "",
  etapaSeguinte: "",
  antes: [""],
  depois: [""],
  resultados: [{ label: "", valor: "", detalhe: "" }],
  galeria: [{ titulo: "", descricao: "", url: "" }],
  galeriaImportada: false,
  integracoesSelecionadas: [],
  integracoesDetectadas: [],
  semIntegracoes: false,
  semMetricas: false,
};

function AdicionarCasePage() {
  const navigate = useNavigate();
  const { edit: editParam } = Route.useSearch();
  const { cases, integracoes, refresh } = usePortalContent();
  const [aba, setAba] = useState("adicionar");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CaseDraft>(emptyForm);
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState("");
  const [actionsItem, setActionsItem] = useState<CaseItem | null>(null);
  const loadedEditRef = useRef<string | null>(null);

  const casesOrdenados = useMemo(() => [...cases], [cases]);

  const casesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return casesOrdenados;
    return casesOrdenados.filter((item) =>
      [item.nome, item.descricao, item.area, item.status, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [casesOrdenados, busca]);

  const set = <K extends keyof CaseDraft>(key: K, value: CaseDraft[K]) =>
    setForm((atual) => ({ ...atual, [key]: value }));

  const limparForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    loadedEditRef.current = null;
  };

  const limparESairDaEdicao = () => {
    limparForm();
    if (editParam) {
      void navigate({ to: "/admin/adicionar-case", search: {} });
    }
  };

  const carregarCase = (item: CaseItem) => {
    const meta = getCaseMeta(item.id);
    const galeriaMeta = meta?.galeria ?? [];
    setEditingId(item.id);
    setForm({
      nome: item.nome,
      descricao: item.descricao,
      area: item.area,
      status: item.status,
      impacto: item.impacto,
      cor: item.cor,
      problema: item.problema,
      dores: meta?.dores?.length ? meta.dores : [""],
      solucao: item.solucao,
      etapaAtual: item.etapaAtual ?? "",
      statusAtual: item.statusAtual ?? "",
      etapaSeguinte: item.etapaSeguinte ?? "",
      antes: item.antes.length ? item.antes : [""],
      depois: item.depois.length ? item.depois : [""],
      resultados: item.resultados.length
        ? item.resultados.map((r) => ({
            label: r.label,
            valor: r.valor,
            detalhe: r.detalhe ?? "",
          }))
        : [{ label: "", valor: "", detalhe: "" }],
      galeria: galeriaMeta.length
        ? galeriaMeta.map((g) => ({
            titulo: g.titulo,
            descricao: g.descricao ?? "",
            url: g.url,
            ...(g.mimeType ? { mimeType: g.mimeType } : {}),
          }))
        : [{ titulo: "", descricao: "", url: "" }],
      galeriaImportada: galeriaMeta.length > 0,
      ...(meta?.jiraEpicKey ? { jiraEpicKey: meta.jiraEpicKey } : {}),
      integracoesSelecionadas: meta?.integracoes?.length
        ? meta.integracoes
        : item.ferramentas ?? [],
      integracoesDetectadas: [],
      semIntegracoes: meta?.semIntegracoes ?? false,
      semMetricas: meta?.semMetricas ?? !(item.resultados?.length > 0),
      ...(item.responsavel ? { responsavel: item.responsavel } : {}),
      ...(item.jiraStatus ? { jiraStatus: item.jiraStatus } : {}),
    });
    setAba("adicionar");
  };

  useEffect(() => {
    if (!editParam) {
      loadedEditRef.current = null;
      return;
    }
    if (loadedEditRef.current === editParam) return;
    const item = cases.find((c) => c.id === editParam);
    if (!item) return;
    loadedEditRef.current = editParam;
    carregarCase(item);
  }, [editParam, cases]);

  const excluirCaseAdmin = (item: CaseItem) => {
    Modal.confirm({
      title: "Excluir do portal?",
      content: (
        <>
          O case <strong>{item.nome}</strong> deixa de aparecer em Projetos. A página no Confluence
          não será removida.
        </>
      ),
      okText: "Excluir do portal",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteCase(item.id);
          if (editingId === item.id) limparForm();
          refresh();
          toast.success("Case excluído do portal", {
            description: "A página no Confluence foi mantida.",
          });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Falha ao excluir o case.");
          throw error;
        }
      },
    });
  };

  const toggleIntegracao = (nome: string) => {
    setForm((atual) => {
      const next = atual.integracoesSelecionadas.includes(nome)
        ? atual.integracoesSelecionadas.filter((i) => i !== nome)
        : [...atual.integracoesSelecionadas, nome];
      return {
        ...atual,
        semIntegracoes: false,
        integracoesSelecionadas: next,
      };
    });
  };

  const setDetectionStatus = (nome: string, status: "confirmed" | "rejected") => {
    setForm((atual) => {
      const integracoesDetectadas =
        status === "rejected"
          ? atual.integracoesDetectadas.filter((item) => item.nome !== nome)
          : atual.integracoesDetectadas.map((item) =>
              item.nome === nome ? { ...item, status } : item,
            );
      const selected = new Set(atual.integracoesSelecionadas);
      if (status === "confirmed") selected.add(nome);
      else selected.delete(nome);
      return {
        ...atual,
        semIntegracoes: false,
        integracoesDetectadas,
        integracoesSelecionadas: [...selected],
      };
    });
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.descricao.trim() || !form.problema.trim() || !form.solucao.trim()) {
      toast.error("Preencha nome, descrição, problema e solução.");
      return;
    }

    const existing = editingId ? cases.find((c) => c.id === editingId) : undefined;
    const id = editingId ?? `${slugify(form.nome) || "case"}-${Date.now().toString(36)}`;
    const item: CaseItem = {
      id,
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      area: form.area.trim() || "Produto",
      ferramentas: form.semIntegracoes ? [] : form.integracoesSelecionadas,
      impacto: form.impacto,
      status: form.status,
      time: form.area,
      responsaveis: existing?.responsaveis ?? [],
      ...(form.responsavel ?? existing?.responsavel
        ? { responsavel: (form.responsavel ?? existing?.responsavel)! }
        : {}),
      ...(form.jiraStatus ?? existing?.jiraStatus
        ? { jiraStatus: (form.jiraStatus ?? existing?.jiraStatus)! }
        : {}),
      acessos: existing?.acessos ?? 0,
      novo: existing?.novo ?? true,
      destaque: existing?.destaque ?? false,
      cor: form.cor,
      problema: form.problema.trim(),
      solucao: form.solucao.trim(),
      ...(form.etapaAtual.trim() ? { etapaAtual: form.etapaAtual.trim() } : {}),
      ...(form.statusAtual.trim() ? { statusAtual: form.statusAtual.trim() } : {}),
      ...(form.etapaSeguinte.trim() ? { etapaSeguinte: form.etapaSeguinte.trim() } : {}),
      antes: form.antes.filter(Boolean),
      depois: form.depois.filter(Boolean),
      fluxo: existing?.fluxo?.length
        ? existing.fluxo
        : ["Dados", "Automação", "IA", "Processamento", "Resultado"],
      etapas: existing?.etapas ?? [],
      resultados: form.semMetricas
        ? []
        : form.resultados
            .filter((r) => r.label || r.valor)
            .map((r) => ({
              label: r.label || "Métrica",
              valor: r.valor || "—",
              ...(r.detalhe ? { detalhe: r.detalhe } : {}),
            })),
      aprendizados: existing?.aprendizados ?? [],
      aulasRelacionadas: existing?.aulasRelacionadas ?? [],
      templatesRelacionados: existing?.templatesRelacionados ?? [],
      ferramentasRelacionadas: existing?.ferramentasRelacionadas ?? [],
      casesRelacionados: existing?.casesRelacionados ?? [],
      tags: (form.semIntegracoes ? [] : form.integracoesSelecionadas).map((n) =>
        n.toLowerCase(),
      ),
    };

    setEnviando(true);
    void (async () => {
      try {
        await saveCustomCase(item, {
          dores: form.dores.filter(Boolean),
          galeria: form.galeria
            .filter((g) => g.titulo || g.url)
            .map((g, i) => ({
              id: `${id}-g${i + 1}`,
              titulo:
                g.titulo ||
                ((g.mimeType ?? "").startsWith("video/") || g.url.startsWith("data:video/")
                  ? `Vídeo ${i + 1}`
                  : `Print ${i + 1}`),
              descricao: g.descricao ?? "",
              url: g.url,
              ...(g.mimeType ? { mimeType: g.mimeType } : {}),
            })),
          integracoes: form.semIntegracoes ? [] : form.integracoesSelecionadas,
          semIntegracoes: form.semIntegracoes,
          semMetricas: form.semMetricas,
          ...(form.jiraEpicKey ? { jiraEpicKey: form.jiraEpicKey } : {}),
          ...(getCaseMeta(id)?.atualizacoes?.length
            ? { atualizacoes: getCaseMeta(id)!.atualizacoes! }
            : {}),
        });
        const metaSalva = getCaseMeta(id);
        if (metaSalva) {
          try {
            const sync = await syncCaseToConfluence(item, metaSalva);
            if (sync.ok) {
              toast.success(sync.message, {
                description: sync.folderCreated
                  ? `Pasta ${item.responsavel?.email} criada em Status Projetos Olivelas.`
                  : `Em Status Projetos Olivelas › ${item.responsavel?.email}.`,
              });
            } else {
              toast.warning(sync.message);
            }
          } catch (confluenceError) {
            toast.warning(
              confluenceError instanceof Error
                ? `Confluence: ${confluenceError.message}`
                : "Não foi possível sincronizar com o Confluence.",
            );
          }
        }
        toast.success(editingId ? "Case atualizado" : "Case publicado no banco", {
          description: `"${item.nome}" já aparece em Projetos.`,
        });
        limparForm();
        refresh();
        navigate({ to: "/cases/$id", params: { id }, search: { de: "cases" } });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar o case.");
      } finally {
        setEnviando(false);
      }
    })();
  };

  const formPane = (
    <form id="form-case" onSubmit={salvar} className="space-y-6 pb-10">
      <JiraImportPanel
        availableIntegrations={integracoes.map((i) => i.nome)}
        onDraft={(draft) => setForm(draft)}
      />

      <AdminFormSection
        tone={0}
        icone={TeamOutlined}
        titulo="Cabeçalho do case"
        descricao="Identidade visual e metadados do topo da página."
      >
        {form.responsavel?.nome ? (
          <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
            <ResponsavelAvatar
              nome={form.responsavel.nome}
              avatarUrl={form.responsavel.avatarUrl}
              className="h-11 w-11"
            />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Responsável (Jira)
              </p>
              <p className="truncate text-sm font-semibold">{form.responsavel.nome}</p>
              {form.responsavel.email ? (
                <p className="truncate text-xs text-muted-foreground">{form.responsavel.email}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <Field label="Nome do case" htmlFor="nome">
          <Input
            id="nome"
            size="large"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            placeholder="Ex: Análise Inteligente de Feedback"
            className="rounded-xl"
          />
        </Field>
        <Field label="Descrição curta" htmlFor="descricao">
          <TextArea
            id="descricao"
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Resumo em 1–2 frases do que a solução faz."
            autoSize={{ minRows: 3 }}
            className="rounded-xl"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Área" hint="Abra no campo para escolher ou cadastrar uma área.">
            <AreaPicker value={form.area} onChange={(area) => set("area", area)} />
          </Field>
          <Field label="Status">
            <StyledSelect
              value={form.status}
              onValueChange={(v) => set("status", v as Status)}
              options={STATUS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
          <Field label="Cor do header">
            <StyledSelect
              value={form.cor}
              onValueChange={(v) => set("cor", v)}
              options={LOFT_COLOR_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
            />
          </Field>
        </div>
      </AdminFormSection>

      <AdminFormSection tone={1} icone={AimOutlined} titulo="Problema" descricao="Seção Problema da página do case.">
        <Field label="Descrição do problema" htmlFor="problema">
          <TextArea
            id="problema"
            value={form.problema}
            onChange={(e) => set("problema", e.target.value)}
            placeholder="Descreva o cenário antes da solução."
            autoSize={{ minRows: 4 }}
            className="rounded-xl"
          />
        </Field>
      </AdminFormSection>

      <AdminFormSection
        tone={2}
        icone={WarningOutlined}
        titulo="Principais dores"
        descricao="Lista exibida em card na página do case."
      >
        <ListEditor
          label="Dores"
          values={form.dores}
          onChange={(dores) => set("dores", dores)}
          placeholder="Ex: Processo manual consumindo horas do time"
          addLabel="Adicionar dor"
        />
      </AdminFormSection>

      <AdminFormSection tone={3} icone={BulbOutlined} titulo="Solução" descricao="Como a IA resolve o problema.">
        <Field label="Descrição da solução" htmlFor="solucao">
          <TextArea
            id="solucao"
            value={form.solucao}
            onChange={(e) => set("solucao", e.target.value)}
            placeholder="Explique o fluxo, ferramentas e o papel da IA."
            autoSize={{ minRows: 4 }}
            className="rounded-xl"
          />
        </Field>
      </AdminFormSection>

      <AdminFormSection
        tone={4}
        icone={RocketOutlined}
        titulo="Andamento do projeto"
        descricao="Etapa atual, status e próximo passo — usados no status report quinzenal."
      >
        <Field label="Etapa atual" htmlFor="etapa-atual">
          <TextArea
            id="etapa-atual"
            value={form.etapaAtual}
            onChange={(e) => set("etapaAtual", e.target.value)}
            placeholder="O que o time está executando agora."
            autoSize={{ minRows: 3 }}
            className="rounded-xl"
          />
        </Field>
        <Field label="Status atual" htmlFor="status-atual">
          <TextArea
            id="status-atual"
            value={form.statusAtual}
            onChange={(e) => set("statusAtual", e.target.value)}
            placeholder="Concluído, em progresso, bloqueios e riscos."
            autoSize={{ minRows: 3 }}
            className="rounded-xl"
          />
        </Field>
        <Field label="Etapa seguinte" htmlFor="etapa-seguinte">
          <TextArea
            id="etapa-seguinte"
            value={form.etapaSeguinte}
            onChange={(e) => set("etapaSeguinte", e.target.value)}
            placeholder="Próximos passos planejados e dependências."
            autoSize={{ minRows: 3 }}
            className="rounded-xl"
          />
        </Field>
      </AdminFormSection>

      <AdminFormSection
        tone={4}
        icone={ApiOutlined}
        titulo="Integrações"
        descricao="Sistemas conectados — cards com ícone entre Solução e Antes x Depois."
      >
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.semIntegracoes}
            onChange={(e) =>
              setForm((atual) => ({
                ...atual,
                semIntegracoes: e.target.checked,
                integracoesSelecionadas: e.target.checked ? [] : atual.integracoesSelecionadas,
              }))
            }
            className="h-4 w-4 rounded border-input"
          />
          <span>Sem integrações — ocultar esta seção na página do case</span>
        </label>
        {!form.semIntegracoes && (
          <div className="space-y-4">
            <IntegrationReview
              detections={form.integracoesDetectadas}
              onConfirm={(nome) => setDetectionStatus(nome, "confirmed")}
              onReject={(nome) => setDetectionStatus(nome, "rejected")}
            />
            <div className="flex flex-wrap gap-2">
              {integracoes.map((i) => {
                const on = form.integracoesSelecionadas.includes(i.nome);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleIntegracao(i.nome)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {i.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </AdminFormSection>

      <AdminFormSection
        tone={5}
        icone={SwapOutlined}
        titulo="Antes x Depois"
        descricao="Comparação em duas colunas."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ListEditor
            label="Antes"
            values={form.antes}
            onChange={(antes) => set("antes", antes)}
            placeholder="Situação anterior"
            multiline
          />
          <ListEditor
            label="Depois"
            values={form.depois}
            onChange={(depois) => set("depois", depois)}
            placeholder="Situação atual"
            multiline
          />
        </div>
      </AdminFormSection>

      <AdminFormSection tone={0} icone={BarChartOutlined} titulo="Resultados" descricao="Métricas em cards.">
        <label className="mb-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/30 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.semMetricas}
            onChange={(e) =>
              setForm((atual) => ({
                ...atual,
                semMetricas: e.target.checked,
                resultados: e.target.checked
                  ? []
                  : atual.resultados.length
                    ? atual.resultados
                    : [{ label: "", valor: "", detalhe: "" }],
              }))
            }
            className="h-4 w-4 rounded border-input"
          />
          <span>Sem métricas — ocultar a seção Resultados na página do case</span>
        </label>
        {!form.semMetricas && (
        <div className="space-y-3">
          {form.resultados.map((r, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-border/70 bg-secondary/30 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                <Input
                  value={r.valor}
                  onChange={(e) => {
                    const next = [...form.resultados];
                    next[index] = { ...r, valor: e.target.value };
                    set("resultados", next);
                  }}
                  placeholder="Valor"
                  className="rounded-xl"
                />
                <Input
                  value={r.label}
                  onChange={(e) => {
                    const next = [...form.resultados];
                    next[index] = { ...r, label: e.target.value };
                    set("resultados", next);
                  }}
                  placeholder="Rótulo"
                  className="rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => set("resultados", form.resultados.filter((_, i) => i !== index))}
                  className="rounded-xl border border-border px-3 text-sm text-muted-foreground hover:bg-secondary"
                >
                  Remover
                </button>
              </div>
              <TextArea
                value={r.detalhe}
                onChange={(e) => {
                  const next = [...form.resultados];
                  next[index] = { ...r, detalhe: e.target.value };
                  set("resultados", next);
                }}
                placeholder="Descrição (opcional) — ex.: Economia geral dos engenheiros"
                autoSize={{ minRows: 2 }}
                className="rounded-xl"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("resultados", [...form.resultados, { label: "", valor: "", detalhe: "" }])
            }
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <PlusOutlined />
            Adicionar métrica
          </button>
        </div>
        )}
      </AdminFormSection>

      <AdminFormSection
        tone={1}
        icone={PictureOutlined}
        titulo={
          isGaleriaImportada(form)
            ? `Galeria (${form.galeria.filter((g) => g.url.trim()).length})`
            : "Galeria"
        }
        descricao={
          isGaleriaImportada(form)
            ? "Na pré-visualização: renomeie, reordene (↑↓) e exclua mídias. Depois clique em Atualizar case."
            : "Imagens de sistemas e dashboards."
        }
      >
        {isGaleriaImportada(form) ? (
          <GaleriaImportSummary
            galeria={form.galeria}
            {...(form.jiraEpicKey ? { epicKey: form.jiraEpicKey } : {})}
          />
        ) : (
          <div className="space-y-3">
            {form.galeria.map((g, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-border/70 p-3">
                <Input
                  value={g.titulo}
                  onChange={(e) => {
                    const next = [...form.galeria];
                    next[index] = { ...g, titulo: e.target.value };
                    set("galeria", next);
                  }}
                  placeholder="Título do print"
                  className="rounded-xl"
                />
                <TextArea
                  value={g.descricao}
                  onChange={(e) => {
                    const next = [...form.galeria];
                    next[index] = { ...g, descricao: e.target.value };
                    set("galeria", next);
                  }}
                  placeholder="Descrição"
                  autoSize={{ minRows: 2 }}
                  className="rounded-xl"
                />
                <Input
                  value={g.url}
                  onChange={(e) => {
                    const next = [...form.galeria];
                    next[index] = { ...g, url: e.target.value };
                    set("galeria", next);
                  }}
                  placeholder="URL da imagem (dashboard / sistema)"
                  className="rounded-xl"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="default"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => {
                      if (index === 0) return;
                      const next = [...form.galeria];
                      const tmp = next[index - 1]!;
                      next[index - 1] = next[index]!;
                      next[index] = tmp;
                      set("galeria", next);
                    }}
                    aria-label="Mover para cima"
                  />
                  <Button
                    type="default"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === form.galeria.length - 1}
                    onClick={() => {
                      if (index >= form.galeria.length - 1) return;
                      const next = [...form.galeria];
                      const tmp = next[index + 1]!;
                      next[index + 1] = next[index]!;
                      next[index] = tmp;
                      set("galeria", next);
                    }}
                    aria-label="Mover para baixo"
                  />
                  <button
                    type="button"
                    onClick={() => set("galeria", form.galeria.filter((_, i) => i !== index))}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Remover print
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set("galeria", [
                  ...form.galeria,
                  { titulo: "", descricao: "", url: "" },
                ])
              }
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <PlusOutlined />
              Adicionar print
            </button>
          </div>
        )}
      </AdminFormSection>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button type="default" onClick={limparESairDaEdicao} disabled={enviando}>
          Limpar
        </Button>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} disabled={enviando}>
          {enviando
            ? editingId
              ? "Atualizando..."
              : "Publicando..."
            : editingId
              ? "Atualizar case"
              : "Publicar case"}
        </Button>
      </div>
    </form>
  );

  const tabAdicionar = (
    <>
      {editingId ? (
        <Card
          className="mb-4 border-primary/20 bg-primary/5"
          styles={{ body: { padding: "12px 16px" } }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Editando case <span className="font-semibold">{form.nome || editingId}</span>
            </p>
            <Button type="default" size="small" onClick={limparESairDaEdicao}>
              Cancelar edição
            </Button>
          </div>
        </Card>
      ) : null}
      <AdminSplitLayout
        form={formPane}
        preview={
          <CaseLivePreview
            draft={form}
            onGaleriaChange={(galeria) => {
              const aindaImportada =
                form.galeriaImportada ||
                galeria.some(
                  (g) =>
                    Boolean(g.url.trim()) &&
                    (Boolean(g.origem?.issueKey) || g.url.startsWith("data:image")),
                );
              setForm((atual) => ({
                ...atual,
                galeria,
                galeriaImportada: aindaImportada && galeria.some((g) => g.url.trim()),
              }));
            }}
          />
        }
      />
    </>
  );

  const tabGerenciar = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {casesFiltrados.length}
        {busca.trim() ? ` de ${casesOrdenados.length}` : ""}{" "}
        {casesOrdenados.length === 1 ? "case cadastrado" : "cases cadastrados"}. Clique
        em um card para abrir, editar ou excluir.
      </p>
      <div className="relative max-w-xl">
        <SearchOutlined className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar cases…"
          size="large"
          className="rounded-2xl pl-10 shadow-card"
          aria-label="Pesquisar cases"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {casesFiltrados.map((item) => (
          <button
            key={item.id}
            type="button"
            className="block w-full cursor-pointer rounded-lg text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setActionsItem(item)}
            aria-label={`Ações para ${item.nome}`}
          >
            <div className="pointer-events-none">
              <CaseCard item={item} de="admin" />
            </div>
          </button>
        ))}
        {casesFiltrados.length === 0 && (
          <Card className="col-span-full border-dashed shadow-none" styles={{ body: { padding: 32 } }}>
            <p className="text-center text-sm text-muted-foreground">
              {busca.trim()
                ? "Nenhum case encontrado para essa pesquisa."
                : "Nenhum case ainda. Cadastre o primeiro na aba Adicionar."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <PageShell
      maxLargura="max-w-[1500px]"
      crumbs={[
        { label: "Home", to: "/portal" },
        { label: "Administração" },
        { label: "Adicionar Projeto" },
      ]}
      eyebrow="Administração"
      titulo="Adicionar Projeto"
      descricao="Cadastre novos cases ou gerencie o catálogo existente."
    >
      <Tabs
        activeKey={aba}
        onChange={setAba}
        className="pt-5 sm:pt-6"
        items={[
          {
            key: "adicionar",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <ProjectOutlined />
                Adicionar
              </span>
            ),
            children: tabAdicionar,
          },
          {
            key: "gerenciar",
            label: (
              <span className="inline-flex items-center gap-1.5">
                <UnorderedListOutlined />
                Todos os cases
              </span>
            ),
            children: tabGerenciar,
          },
        ]}
      />

      <AdminCatalogActionsDialog
        open={Boolean(actionsItem)}
        onOpenChange={(open) => {
          if (!open) setActionsItem(null);
        }}
        title={actionsItem?.nome ?? ""}
        description={actionsItem?.descricao}
        onOpen={() => {
          if (!actionsItem) return;
          void navigate({
            to: "/cases/$id",
            params: { id: actionsItem.id },
            search: { de: "cases" },
          });
        }}
        onEdit={() => {
          if (!actionsItem) return;
          carregarCase(actionsItem);
        }}
        onDelete={() => {
          if (!actionsItem) return;
          excluirCaseAdmin(actionsItem);
        }}
      />

      <JiraImportLoading open={enviando} done={false} variant="publish" />
    </PageShell>
  );
}
