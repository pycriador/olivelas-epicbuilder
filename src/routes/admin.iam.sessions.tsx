import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Table, Tag } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import { listSessions, revokeSession, type SessionRow } from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/sessions")({
  head: () => ({
    meta: [{ title: "Sessões — IAM | Olivelas App Model" }],
  }),
  component: IamSessionsPage,
});

function IamSessionsPage() {
  const [items, setItems] = useState<SessionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSessions({ page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar sessões");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRevoke = (row: SessionRow) => {
    Modal.confirm({
      title: "Encerrar sessão?",
      content: `IP ${row.ip_address} · ${row.browser} / ${row.os}`,
      okText: "Encerrar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await revokeSession(row.id);
        toast.success("Sessão encerrada");
        await load();
      },
    });
  };

  return (
    <IamAdminShell title="Sessões" description="Sessões ativas e encerramento remoto.">
      <IamSectionCard flush>
        <Table<SessionRow>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          columns={[
            { title: "Usuário", dataIndex: "user_id", ellipsis: true },
            { title: "IP", dataIndex: "ip_address", width: 140 },
            {
              title: "Cliente",
              render: (_, r) => `${r.browser} / ${r.os}`,
            },
            {
              title: "Lembrar",
              dataIndex: "remember_me",
              render: (v: boolean) => (v ? "Sim" : "Não"),
              width: 90,
            },
            {
              title: "Atual",
              dataIndex: "current",
              render: (v: boolean) => (v ? <Tag color="orange">Atual</Tag> : "—"),
              width: 90,
            },
            {
              title: "Último acesso",
              dataIndex: "last_seen_at",
              render: (v: string) => new Date(v).toLocaleString("pt-BR"),
            },
            {
              title: "Ações",
              width: 80,
              render: (_, r) => (
                <Space>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="Encerrar"
                    onClick={() => onRevoke(r)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </IamSectionCard>
    </IamAdminShell>
  );
}
