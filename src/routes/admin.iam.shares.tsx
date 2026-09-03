import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import { createShare, deleteShare, listShares, type Share } from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/shares")({
  head: () => ({
    meta: [{ title: "Compartilhamentos — IAM | AIOPS App Model" }],
  }),
  component: IamSharesPage,
});

function IamSharesPage() {
  const [items, setItems] = useState<Share[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listShares({ page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar compartilhamentos");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    const values = await form.validateFields();
    try {
      await createShare(values);
      toast.success("Compartilhamento criado");
      setOpen(false);
      form.resetFields();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao criar");
    }
  };

  const onDelete = (row: Share) => {
    Modal.confirm({
      title: "Revogar compartilhamento?",
      okText: "Revogar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await deleteShare(row.id);
        toast.success("Compartilhamento revogado");
        await load();
      },
    });
  };

  return (
    <IamAdminShell
      title="Compartilhamentos"
      description="Conceda acesso pontual a recursos."
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Novo share
        </Button>
      }
    >
      <IamSectionCard flush>
        <Table<Share>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          columns={[
            { title: "Tipo recurso", dataIndex: "resource_type" },
            { title: "ID recurso", dataIndex: "resource_id", ellipsis: true },
            { title: "Permissão", dataIndex: "permission", width: 110 },
            {
              title: "Destinatário",
              render: (_, r) => `${r.grantee_type}: ${r.grantee_id}`,
              ellipsis: true,
            },
            {
              title: "Criado em",
              dataIndex: "created_at",
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
                    onClick={() => onDelete(r)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </IamSectionCard>

      <Modal
        title="Novo compartilhamento"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onCreate()}
        okText="Criar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ permission: "read", grantee_type: "user" }}
        >
          <Form.Item name="resource_type" label="Tipo de recurso" rules={[{ required: true }]}>
            <Input placeholder="case" />
          </Form.Item>
          <Form.Item name="resource_id" label="ID do recurso" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="permission" label="Permissão" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "read", label: "Leitura" },
                { value: "comment", label: "Comentário" },
                { value: "edit", label: "Edição" },
                { value: "admin", label: "Admin" },
              ]}
            />
          </Form.Item>
          <Form.Item name="grantee_type" label="Tipo de destinatário" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "user", label: "Usuário" },
                { value: "group", label: "Grupo" },
              ]}
            />
          </Form.Item>
          <Form.Item name="grantee_id" label="ID do destinatário" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </IamAdminShell>
  );
}
