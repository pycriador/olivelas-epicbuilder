import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import {
  createGroup,
  deleteGroup,
  listGroups,
  listRoles,
  updateGroup,
  type Group,
  type Role,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/groups")({
  head: () => ({
    meta: [{ title: "Grupos — IAM | Olivelas App Model" }],
  }),
  component: IamGroupsPage,
});

function IamGroupsPage() {
  const [items, setItems] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGroups({ page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar grupos");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void listRoles({ page_size: 100 })
      .then((r) => setRoles(r.items))
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", color: "#FF774A", icon: "team" });
    setOpen(true);
  };

  const openEdit = (group: Group) => {
    setEditing(group);
    form.setFieldsValue(group);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateGroup(editing.id, values);
        toast.success("Grupo atualizado");
      } else {
        await createGroup(values);
        toast.success("Grupo criado");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar");
    }
  };

  const onDelete = (group: Group) => {
    Modal.confirm({
      title: "Excluir grupo?",
      content: group.name,
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await deleteGroup(group.id);
        toast.success("Grupo excluído");
        await load();
      },
    });
  };

  return (
    <IamAdminShell
      title="Grupos"
      description="Organize usuários e associe roles."
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Novo grupo
        </Button>
      }
    >
      <IamSectionCard flush>
        <Table<Group>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{ current: page, total, pageSize: 20, onChange: setPage }}
          columns={[
            {
              title: "Nome",
              dataIndex: "name",
              render: (name: string, r) => (
                <Space>
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: r.color }}
                  />
                  {name}
                </Space>
              ),
            },
            { title: "Descrição", dataIndex: "description", ellipsis: true },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "Sistema",
              dataIndex: "is_system",
              render: (v: boolean) => (v ? "Sim" : "Não"),
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
        title={editing ? "Editar grupo" : "Novo grupo"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onSubmit()}
        okText="Salvar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="color" label="Cor">
            <Input type="color" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: "active", label: "Ativo" },
                { value: "disabled", label: "Desativado" },
              ]}
            />
          </Form.Item>
          <Form.Item name="role_ids" label="Roles">
            <Select
              mode="multiple"
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              placeholder="Selecione roles"
            />
          </Form.Item>
        </Form>
      </Modal>
    </IamAdminShell>
  );
}
