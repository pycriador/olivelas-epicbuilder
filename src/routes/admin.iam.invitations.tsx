import { PlusOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import {
  cancelInvitation,
  createInvitation,
  listGroups,
  listInvitations,
  resendInvitation,
  type Group,
  type Invitation,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/invitations")({
  head: () => ({
    meta: [{ title: "Convites — IAM | AIOps App Model" }],
  }),
  component: IamInvitationsPage,
});

function IamInvitationsPage() {
  const [items, setItems] = useState<Invitation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInvitations({ page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar convites");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void listGroups({ page_size: 100 })
      .then((g) => setGroups(g.items))
      .catch(() => undefined);
  }, []);

  const onCreate = async () => {
    const values = await form.validateFields();
    try {
      const invite = await createInvitation(values);
      toast.success("Convite criado");
      if (invite.invite_token) {
        toast.message("Token de desenvolvimento", { description: invite.invite_token });
      }
      setOpen(false);
      form.resetFields();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar convite");
    }
  };

  return (
    <IamAdminShell
      title="Convites"
      description="Convide novos usuários por e-mail."
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Novo convite
        </Button>
      }
    >
      <IamSectionCard flush>
        <Table<Invitation>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          columns={[
            { title: "E-mail", dataIndex: "email" },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "Expira em",
              dataIndex: "expires_at",
              render: (v: string) => new Date(v).toLocaleString("pt-BR"),
            },
            {
              title: "Criado em",
              dataIndex: "created_at",
              render: (v: string) => new Date(v).toLocaleString("pt-BR"),
            },
            {
              title: "Ações",
              width: 140,
              render: (_, r) =>
                r.status === "pending" ? (
                  <Space>
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      aria-label="Reenviar"
                      onClick={() =>
                        void resendInvitation(r.id)
                          .then(() => {
                            toast.success("Convite reenviado");
                            return load();
                          })
                          .catch((err: unknown) =>
                            toast.error(err instanceof Error ? err.message : "Falha ao reenviar"),
                          )
                      }
                    />
                    <Button
                      type="text"
                      danger
                      icon={<StopOutlined />}
                      aria-label="Cancelar"
                      onClick={() =>
                        void cancelInvitation(r.id)
                          .then(() => {
                            toast.success("Convite cancelado");
                            return load();
                          })
                          .catch((err: unknown) =>
                            toast.error(err instanceof Error ? err.message : "Falha ao cancelar"),
                          )
                      }
                    />
                  </Space>
                ) : null,
            },
          ]}
        />
      </IamSectionCard>

      <Modal
        title="Novo convite"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onCreate()}
        okText="Enviar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ expires_in_hours: 72 }}>
          <Form.Item name="email" label="E-mail" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="group_id" label="Grupo inicial">
            <Select
              allowClear
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              placeholder="Opcional"
            />
          </Form.Item>
        </Form>
      </Modal>
    </IamAdminShell>
  );
}
