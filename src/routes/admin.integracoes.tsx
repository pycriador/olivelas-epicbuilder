import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Input, Space, Table, Typography } from "antd";
import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import {
  fetchConfluenceSpaces,
  fetchIntegrationsStatus,
  searchJiraIssues,
} from "@/lib/integrations-api";

export const Route = createFileRoute("/admin/integracoes")({
  head: () => ({
    meta: [
      { title: "Status das integrações — AIOPS App Model" },
      {
        name: "description",
        content: "Diagnóstico das conexões com Jira, Confluence e Gemini do AIOPS App Model.",
      },
      { property: "og:title", content: "Status das integrações — AIOPS App Model" },
      {
        property: "og:description",
        content: "Diagnóstico das conexões com Jira, Confluence e Gemini do AIOPS App Model.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntegracoesStatusPage,
});

const { Text } = Typography;

function IntegracoesStatusPage() {
  const [projeto, setProjeto] = useState("Squad AIOPS");
  const [consulta, setConsulta] = useState("");

  const status = useQuery({
    queryKey: ["integrations-status"],
    queryFn: () => fetchIntegrationsStatus(),
  });
  const spaces = useQuery({
    queryKey: ["confluence-spaces"],
    queryFn: () => fetchConfluenceSpaces(),
    retry: false,
  });
  const issues = useQuery({
    queryKey: ["jira-issues", consulta],
    queryFn: () => searchJiraIssues({ query: consulta, limit: 20 }),
    enabled: Boolean(consulta),
    retry: false,
  });

  const statusRows = Object.entries(status.data ?? {}).map(([nome, info]) => ({
    key: nome,
    nome,
    ok: info.ok,
    detalhe: info.detail,
  }));

  return (
    <PageShell
      crumbs={[
        { label: "Home", to: "/portal" },
        { label: "Admin" },
        { label: "Integrações" },
      ]}
      eyebrow="Admin"
      titulo="Status das integrações"
      descricao="Jira, Confluence e Gemini via backend FastAPI (VITE_API_URL)."
    >
      <div className="space-y-4">
        <Card className="border-border shadow-card" styles={{ body: { padding: 20 } }}>
          {status.isLoading ? (
            <Text type="secondary">Testando conexões…</Text>
          ) : (
            <Table
              size="middle"
              pagination={false}
              dataSource={statusRows}
              columns={[
                {
                  title: "Integração",
                  dataIndex: "nome",
                  key: "nome",
                  render: (nome: string) => <Text strong>{nome}</Text>,
                },
                {
                  title: "Status",
                  dataIndex: "ok",
                  key: "ok",
                  width: 120,
                  render: (ok: boolean) => (
                    <Text type={ok ? "success" : "danger"}>{ok ? "OK" : "Falha"}</Text>
                  ),
                },
                {
                  title: "Detalhe",
                  dataIndex: "detalhe",
                  key: "detalhe",
                },
              ]}
            />
          )}
        </Card>

        <Card
          title={<span className="text-sm font-semibold">Spaces do Confluence</span>}
          className="border-border shadow-card"
        >
          {spaces.isError ? (
            <Alert type="error" showIcon message={(spaces.error as Error).message} />
          ) : (
            <Table
              size="middle"
              pagination={false}
              loading={spaces.isLoading}
              dataSource={(spaces.data ?? []).map((s) => ({
                id: s.id,
                name: s.name,
                spaceKey: s.key,
              }))}
              rowKey="id"
              columns={[
                { title: "Nome", dataIndex: "name", key: "name" },
                { title: "Key", dataIndex: "spaceKey", key: "spaceKey", width: 120 },
              ]}
            />
          )}
        </Card>

        <Card
          title={<span className="text-sm font-semibold">Issues do Jira</span>}
          className="border-border shadow-card"
        >
          <Space wrap className="mb-4">
            <Input
              value={projeto}
              onChange={(e) => setProjeto(e.target.value)}
              placeholder="Nome ou chave do projeto"
              style={{ width: 280 }}
              aria-label="Projeto Jira"
            />
            <Button type="primary" onClick={() => setConsulta(projeto.trim())}>
              Buscar issues
            </Button>
          </Space>
          {issues.isError ? (
            <Alert type="error" showIcon message={(issues.error as Error).message} />
          ) : (
            <Table
              size="middle"
              pagination={false}
              loading={issues.isFetching}
              dataSource={(issues.data ?? []).map((i) => ({ ...i, rowKey: i.key }))}
              rowKey="rowKey"
              columns={[
                { title: "Key", dataIndex: "key", key: "key", width: 120 },
                { title: "Resumo", dataIndex: "summary", key: "summary" },
                { title: "Tipo", dataIndex: "type", key: "type", width: 120 },
                { title: "Status", dataIndex: "status", key: "status", width: 140 },
              ]}
            />
          )}
        </Card>
      </div>
    </PageShell>
  );
}
