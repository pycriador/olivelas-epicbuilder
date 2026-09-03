import { Alert, Table, Typography } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import { IamStatCard } from "@/components/admin/iam/IamStatCard";
import { fetchIamDashboard, type AuditLog, type DashboardStats } from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/")({
  head: () => ({
    meta: [{ title: "IAM — Dashboard | AIOPS App Model" }],
  }),
  component: IamDashboardPage,
});

function IamDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setStats(await fetchIamDashboard());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Usuários", value: stats?.users, to: "/admin/iam/users" },
    { label: "Grupos", value: stats?.groups, to: "/admin/iam/groups" },
    { label: "Permissões", value: stats?.permissions, to: "/admin/iam/permissions" },
    { label: "Sessões ativas", value: stats?.sessions, to: "/admin/iam/sessions" },
    {
      label: "Convites pendentes",
      value: stats?.pending_invitations,
      to: "/admin/iam/invitations",
    },
  ];

  return (
    <IamAdminShell
      title="Dashboard"
      description="Visão geral de identidade, acesso e auditoria da plataforma."
    >
      {error ? <Alert type="error" showIcon message={error} /> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <IamStatCard
            key={c.label}
            label={c.label}
            value={c.value ?? null}
            to={c.to}
            loading={loading}
          />
        ))}
      </div>

      <IamSectionCard
        title="Eventos recentes"
        description="Últimas ações registradas na auditoria."
        flush
      >
        <Table<AuditLog>
          rowKey="id"
          size="middle"
          loading={loading}
          pagination={false}
          dataSource={stats?.recent_logs ?? []}
          locale={{ emptyText: "Nenhum evento recente" }}
          columns={[
            { title: "Ação", dataIndex: "action" },
            { title: "Recurso", dataIndex: "resource_type" },
            { title: "IP", dataIndex: "ip_address", width: 140 },
            {
              title: "Quando",
              dataIndex: "created_at",
              width: 180,
              render: (v: string) => new Date(v).toLocaleString("pt-BR"),
            },
          ]}
        />
      </IamSectionCard>

      {!loading && !error && !stats?.recent_logs?.length ? (
        <Typography.Text type="secondary" className="text-sm">
          Os indicadores são atualizados ao carregar esta página.
        </Typography.Text>
      ) : null}
    </IamAdminShell>
  );
}
