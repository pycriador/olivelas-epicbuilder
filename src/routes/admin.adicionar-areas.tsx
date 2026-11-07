import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Modal, Select } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminFormSection, Field } from "@/components/admin/AdminForm";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/portal/SectionHeading";
import { usePortalContent } from "@/hooks/use-portal-content";
import {
  deleteCustomArea,
  renameCustomArea,
  saveCustomArea,
} from "@/lib/content-store";

export const Route = createFileRoute("/admin/adicionar-areas")({
  head: () => ({
    meta: [
      { title: "Adicionar Áreas — Administração | Olivelas" },
      {
        name: "description",
        content: "Cadastre e gerencie áreas de negócio usadas nos cases e no AI Map.",
      },
    ],
  }),
  component: AdicionarAreasPage,
});

function AdicionarAreasPage() {
  const { areas, cases, hydrated, refresh } = usePortalContent();
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const fromCases = cases.map((c) => c.area.trim()).filter(Boolean);
    const merged = [...new Set([...areas, ...fromCases])];
    return merged.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [areas, cases]);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((area) => area.toLowerCase().includes(q));
  }, [lista, busca]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cases) {
      const area = item.area.trim();
      if (!area) continue;
      map.set(area, (map.get(area) ?? 0) + 1);
    }
    return map;
  }, [cases]);

  const destinos = useMemo(
    () => lista.filter((a) => a.toLowerCase() !== (excluindo ?? "").toLowerCase()),
    [lista, excluindo],
  );

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nome.trim();
    if (!clean) {
      toast.error("Informe o nome da área.");
      return;
    }
    if (lista.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      toast.error("Essa área já existe.");
      return;
    }
    setEnviando(true);
    void (async () => {
      try {
        await saveCustomArea(clean);
        refresh();
        setNome("");
        toast.success("Área salva no banco", {
          description: `"${clean}" já pode ser usada nos cases e no AI Map.`,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao salvar área.");
      } finally {
        setEnviando(false);
      }
    })();
  };

  const abrirEdicao = (area: string) => {
    setEditando(area);
    setNovoNome(area);
  };

  const salvarEdicao = () => {
    if (!editando) return;
    const clean = novoNome.trim();
    if (!clean) {
      toast.error("Informe o novo nome.");
      return;
    }
    if (
      clean.toLowerCase() !== editando.toLowerCase() &&
      lista.some((a) => a.toLowerCase() === clean.toLowerCase())
    ) {
      toast.error("Já existe uma área com esse nome.");
      return;
    }
    void (async () => {
      try {
        await renameCustomArea(editando, clean);
        refresh();
        setEditando(null);
        toast.success("Área atualizada", {
          description:
            (counts.get(editando) ?? 0) > 0
              ? `Cases transferidos para "${clean}".`
              : undefined,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao editar área.");
      }
    })();
  };

  const abrirExclusao = (area: string) => {
    setExcluindo(area);
    const outros = lista.filter((a) => a.toLowerCase() !== area.toLowerCase());
    setTransferTo(outros[0] ?? "");
  };

  const confirmarExclusao = () => {
    if (!excluindo) return;
    if (!transferTo.trim()) {
      toast.error("Escolha a área que vai receber os cases.");
      return;
    }
    void (async () => {
      try {
        const moved = counts.get(excluindo) ?? 0;
        await deleteCustomArea(excluindo, transferTo);
        refresh();
        setExcluindo(null);
        toast.success("Área excluída", {
          description:
            moved > 0
              ? `${moved} ${moved === 1 ? "case transferido" : "cases transferidos"} para "${transferTo}".`
              : undefined,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao excluir área.");
      }
    })();
  };

  return (
    <PageShell
      maxLargura="max-w-[1100px]"
      crumbs={[
        { label: "Home", to: "/portal" },
        { label: "Administração" },
        { label: "Adicionar Áreas" },
      ]}
      eyebrow="Administração"
      titulo="Adicionar Áreas"
      descricao="Gerencie as áreas de negócio disponíveis no portal, no AI Map e no cadastro de cases."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={salvar} className="space-y-6">
          <AdminFormSection
            tone={2}
            icone={EnvironmentOutlined}
            titulo="Nova área"
            descricao="O nome aparece no seletor de área dos cases e no mapa."
          >
            <Field label="Nome da área" htmlFor="area-nome">
              <Input
                id="area-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Jurídico, People, Dados…"
                size="large"
                className="rounded-xl"
              />
            </Field>
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={enviando}>
                {enviando ? "Salvando..." : "Salvar área"}
              </Button>
            </div>
          </AdminFormSection>
        </form>

        <section className="pt-2">
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar áreas…"
            size="large"
            prefix={<SearchOutlined className="text-muted-foreground" />}
            className="mb-4 rounded-full shadow-card"
            aria-label="Pesquisar áreas"
          />
          <SectionHeading
            titulo="Áreas"
            descricao={
              hydrated
                ? "Edite ou exclua qualquer área. Ao excluir, os cases precisam ser transferidos."
                : "Carregando áreas do banco…"
            }
          />
          <div className="mt-4 grid gap-2">
            {!hydrated ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl border border-border/60 bg-secondary/50"
                />
              ))
            ) : filtradas.length ? (
              filtradas.map((area) => (
                <Card
                  key={area}
                  className="shadow-card"
                  styles={{ body: { padding: "12px 16px" } }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{area}</p>
                      <p className="text-xs text-muted-foreground">
                        {counts.get(area) ?? 0}{" "}
                        {(counts.get(area) ?? 0) === 1 ? "case" : "cases"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        className="text-muted-foreground"
                        onClick={() => abrirEdicao(area)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="text-muted-foreground hover:!text-destructive"
                        onClick={() => abrirExclusao(area)}
                        disabled={lista.length <= 1}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="border-dashed shadow-none" styles={{ body: { padding: "24px 16px" } }}>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <PlusOutlined />
                  {busca.trim()
                    ? "Nenhuma área encontrada para essa pesquisa."
                    : "Nenhuma área ainda. Cadastre a primeira ao lado."}
                </div>
              </Card>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={!!editando}
        onCancel={() => setEditando(null)}
        title="Editar área"
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={() => setEditando(null)}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={salvarEdicao}>
            Salvar
          </Button>,
        ]}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          O novo nome será aplicado também aos cases desta área.
        </p>
        <Field label="Nome" htmlFor="area-edit-nome">
          <Input
            id="area-edit-nome"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            size="large"
            className="rounded-xl"
          />
        </Field>
      </Modal>

      <Modal
        open={!!excluindo}
        onCancel={() => setExcluindo(null)}
        title="Excluir área"
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={() => setExcluindo(null)}>
            Cancelar
          </Button>,
          <Button
            key="delete"
            danger
            type="primary"
            onClick={confirmarExclusao}
            disabled={!transferTo}
          >
            Excluir e transferir
          </Button>,
        ]}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {excluindo
            ? `Para excluir "${excluindo}", escolha para qual área transferir os ${counts.get(excluindo) ?? 0} ${(counts.get(excluindo) ?? 0) === 1 ? "case" : "cases"}.`
            : null}
        </p>
        <Field label="Transferir cases para" htmlFor="area-transfer">
          <Select
            id="area-transfer"
            value={transferTo || undefined}
            onChange={(value) => setTransferTo(value ?? "")}
            size="large"
            className="w-full"
            options={destinos.map((area) => ({ value: area, label: area }))}
          />
        </Field>
      </Modal>
    </PageShell>
  );
}
