import { useState } from "react";
import { toast } from "sonner";
import { Button, Input } from "antd";

import jiraLogo from "@/assets/logos/jira.svg";
import type { CaseDraft } from "@/components/admin/CaseLivePreview";
import { JiraImportLoading } from "@/components/admin/JiraImportLoading";
import type { Impacto, Status } from "@/data/types";
import { importCaseFromJira } from "@/lib/jira-import";

const STATUS: Status[] = ["Em produção", "Piloto", "Em desenvolvimento", "Experimento"];
const IMPACTOS: Impacto[] = ["Alto", "Médio", "Baixo"];

function JiraIcon({ className }: { className?: string }) {
  return <img src={jiraLogo} alt="" aria-hidden className={className} />;
}

function asStatus(value: string): Status {
  return (STATUS.includes(value as Status) ? value : "Piloto") as Status;
}

function asImpacto(value: string): Impacto {
  return (IMPACTOS.includes(value as Impacto) ? value : "Médio") as Impacto;
}

export function JiraImportPanel({
  availableIntegrations,
  onDraft,
}: {
  availableIntegrations: string[];
  onDraft: (draft: CaseDraft) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [url, setUrl] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const importar = async () => {
    if (!url.trim()) {
      toast.error("Cole o link do projeto ou issue no Jira.");
      return;
    }
    setConcluido(false);
    setCarregando(true);
    try {
      const result = await importCaseFromJira({
        projectUrl: url.trim(),
        availableIntegrations,
      });
      const d = result.draft;
      const origins = result.meta.galleryOrigins ?? [];
      const epicKey = result.meta.epicKey || "";
      onDraft({
        nome: d.nome || "",
        descricao: d.descricao || "",
        area: d.area || "Produto",
        status: asStatus(d.status),
        impacto: asImpacto(d.impacto),
        cor: d.cor || "#115644",
        problema: d.problema || "",
        dores: d.dores?.length ? d.dores : [""],
        solucao: d.solucao || "",
        etapaAtual: d.etapaAtual || "",
        statusAtual: d.statusAtual || "",
        etapaSeguinte: d.etapaSeguinte || "",
        antes: d.antes?.length ? d.antes : [""],
        depois: d.depois?.length ? d.depois : [""],
        resultados: d.resultados?.length
          ? d.resultados.map((r) => ({
              label: r.label || "",
              valor: r.valor || "",
              detalhe: r.detalhe || "",
            }))
          : [{ label: "", valor: "", detalhe: "" }],
        galeria: d.galeria?.filter((g) => g.url)?.length
          ? d.galeria
              .filter((g) => g.url)
              .map((g, index) => {
                const fromDraft = g.origem?.issueKey
                  ? {
                      issueKey: g.origem.issueKey,
                      issueType: g.origem.issueType || "Issue",
                      issueSummary: g.origem.issueSummary || "",
                    }
                  : undefined;
                const fromMeta = origins[index]?.issueKey
                  ? {
                      issueKey: origins[index]!.issueKey,
                      issueType: origins[index]!.issueType || "Issue",
                      issueSummary: origins[index]!.issueSummary || "",
                    }
                  : undefined;
                const origem = fromDraft ?? fromMeta;
                const item: {
                  titulo: string;
                  descricao: string;
                  url: string;
                  mimeType?: string;
                  origem?: {
                    issueKey: string;
                    issueType: string;
                    issueSummary: string;
                  };
                } = {
                  titulo: g.titulo || "",
                  descricao: "",
                  url: g.url || "",
                };
                if (g.mimeType) item.mimeType = g.mimeType;
                if (origem) item.origem = origem;
                return item;
              })
          : [{ titulo: "", descricao: "", url: "" }],
        galeriaImportada: Boolean(d.galeria?.some((g) => g.url)),
        ...(epicKey ? { jiraEpicKey: epicKey } : {}),
        integracoesSelecionadas: [],
        integracoesDetectadas: (() => {
          const seen = new Set<string>();
          const list = [];
          for (const item of d.integracoesDetectadas ?? []) {
            const key = item.nome.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            const citationKeys = new Set<string>();
            const citations = [];
            for (const c of item.citations ?? []) {
              const ck = `${c.issueKey}|${c.field}|${c.quote}`.toLowerCase();
              if (citationKeys.has(ck)) continue;
              citationKeys.add(ck);
              citations.push(c);
            }
            list.push({
              nome: item.nome,
              motivo: item.motivo,
              status: "pending" as const,
              citations,
            });
          }
          return list;
        })(),
        semIntegracoes: false,
        semMetricas: Boolean(d.semMetricas),
        ...(d.responsavel ? { responsavel: d.responsavel } : {}),
        ...(d.jiraStatus ? { jiraStatus: d.jiraStatus } : {}),
      });
      setConcluido(true);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      toast.success("Conteúdo do Jira organizado no formulário", {
        description: result.meta.epicKey
          ? `Épico ${result.meta.epicKey}${result.meta.epicSummary ? ` — ${result.meta.epicSummary}` : ""} · ${result.meta.issuesCount ?? 0} issues · ${result.meta.attachmentsCount ?? 0} mídias. Revise e salve quando quiser.`
          : "Revise os campos e salve o case quando estiver pronto.",
      });
      setAberto(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na importação do Jira.");
    } finally {
      setCarregando(false);
      setConcluido(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 border-t-[3px] border-t-[#2684FF] bg-white p-4 shadow-[0_8px_24px_-16px_rgba(37,48,44,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#DEEBFF]">
              <JiraIcon className="h-4 w-4 object-contain" />
            </span>
            Adicionar com o Jira
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
            Cole o link de um épico, história ou task. O sistema sobe até o épico, varre
            histórias/tasks/subtasks vinculadas, puxa descrições, comentários, prints e vídeos, e a IA
            organiza o formulário sem inventar dados — nada é publicado até você salvar.
          </p>
        </div>
      </div>

      {!aberto ? (
        <div className="mt-4">
          <Button
            type="primary"
            htmlType="button"
            onClick={() => setAberto(true)}
            style={{ background: "#0052CC", borderColor: "#0052CC" }}
            icon={
              <span className="grid h-5 w-5 place-items-center rounded-md bg-white p-0.5">
                <JiraIcon className="h-3.5 w-3.5 object-contain" />
              </span>
            }
          >
            Importar do Jira
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
          <label className="block text-xs font-medium text-muted-foreground" htmlFor="jira-url">
            Link do projeto ou issue no Jira
          </label>
          <Input
            id="jira-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://seu.atlassian.net/jira/software/projects/PROJ"
            disabled={carregando}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="primary"
              htmlType="button"
              onClick={importar}
              disabled={carregando}
              style={{ background: "#0052CC", borderColor: "#0052CC" }}
              icon={
                <span className="grid h-5 w-5 place-items-center rounded-md bg-white p-0.5">
                  <JiraIcon className="h-3.5 w-3.5 object-contain" />
                </span>
              }
            >
              Buscar e preencher formulário
            </Button>
            <Button
              type="text"
              htmlType="button"
              disabled={carregando}
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Usa o token do Jira e a API do Gemini configurados no Backend/.env
            </p>
          </div>
        </div>
      )}
      <JiraImportLoading open={carregando} done={concluido} />
    </div>
  );
}
