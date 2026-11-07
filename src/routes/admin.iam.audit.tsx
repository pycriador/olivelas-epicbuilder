import { Input, Table } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import { listAuditLogs, type AuditLog } from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/audit")({
  head: () => ({
    meta: [{ title: "Auditoria — IAM | Olivelas App Model" }],
  }),
  component: IamAuditPage,
});

function IamAuditPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs({
        page,
        page_size: 20,
        ...(action ? { action } : {}),
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar auditoria");
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <IamAdminShell
      title="Auditoria"
      description="Histórico de ações de autenticação e administração."
    >
      <IamSectionCard
        flush
        toolbar={
          <Input.Search
            style={{ maxWidth: 360 }}
            placeholder="Filtrar por ação (ex.: auth.login)"
            allowClear
            onSearch={(v) => {
              setPage(1);
              setAction(v);
            }}
          />
        }
      >
        <Table<AuditLog>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          expandable={{
            expandedRowRender: (r) => (
              <pre className="max-h-48 overflow-auto text-xs">
                {JSON.stringify({ before: r.before, after: r.after }, null, 2)}
              </pre>
            ),
          }}
          columns={[
            { title: "Ação", dataIndex: "action" },
            { title: "Usuário", dataIndex: "user_id", ellipsis: true },
            { title: "Recurso", dataIndex: "resource_type", width: 120 },
            { title: "ID recurso", dataIndex: "resource_id", ellipsis: true },
            { title: "IP", dataIndex: "ip_address", width: 130 },
            {
              title: "Quando",
              dataIndex: "created_at",
              render: (v: string) => new Date(v).toLocaleString("pt-BR"),
              width: 180,
            },
          ]}
        />
      </IamSectionCard>
    </IamAdminShell>
  );
}
