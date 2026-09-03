import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import {
  createRole,
  deleteRole,
  listPermissions,
  listRoles,
  updateRole,
  type Permission,
  type Role,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/roles")({
  head: () => ({
    meta: [{ title: "Roles — IAM | AIOps App Model" }],
  }),
  component: IamRolesPage,
});

function IamRolesPage() {
  const [items, setItems] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listRoles({ page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar roles");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void listPermissions({ page_size: 100 })
      .then((p) => setPermissions(p.items))
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", priority: 100 });
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    form.setFieldsValue(role);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateRole(editing.id, values);
        toast.success("Role atualizada");
      } else {
        await createRole(values);
        toast.success("Role criada");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar");
    }
  };

  const onDelete = (role: Role) => {
    Modal.confirm({
      title: "Excluir role?",
      content: role.name,
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await deleteRole(role.id);
        toast.success("Role excluída");
        await load();
      },
    });
  };

  return (
    <IamAdminShell
      title="Roles"
      description="Defina papéis e suas permissões."
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Nova role
        </Button>
      }
    >
      <IamSectionCard flush>
        <Table<Role>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          columns={[
            { title: "Nome", dataIndex: "name" },
            { title: "Descrição", dataIndex: "description", ellipsis: true },
            { title: "Prioridade", dataIndex: "priority", width: 100 },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "Permissões",
              dataIndex: "permission_ids",
              render: (ids: string[]) => ids?.length ?? 0,
            },
            {
              title: "Ações",
              width: 120,
              render: (_, r) => (
                <Space>
                  <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={r.is_system}
                    onClick={() => onDelete(r)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </IamSectionCard>

      <Modal
        title={editing ? "Editar role" : "Nova role"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onSubmit()}
        okText="Salvar"
        cancelText="Cancelar"
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="priority" label="Prioridade">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: "active", label: "Ativo" },
                { value: "disabled", label: "Desativado" },
              ]}
            />
          </Form.Item>
          <Form.Item name="permission_ids" label="Permissões">
            <Select
              mode="multiple"
              optionFilterProp="label"
              options={permissions.map((p) => ({
                value: p.id,
                label: `${p.code} — ${p.name}`,
              }))}
              placeholder="Selecione permissões"
            />
          </Form.Item>
        </Form>
      </Modal>
    </IamAdminShell>
  );
}
