import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { IamAdminShell } from "@/components/admin/iam/IamAdminShell";
import { IamSectionCard } from "@/components/admin/iam/IamSectionCard";
import {
  createUser,
  deleteUser,
  listGroups,
  listUsers,
  updateUser,
  type AuthUser,
  type Group,
} from "@/lib/auth-api";

export const Route = createFileRoute("/admin/iam/users")({
  head: () => ({
    meta: [{ title: "Usuários — IAM | Olivelas App Model" }],
  }),
  component: IamUsersPage,
});

function IamUsersPage() {
  const [items, setItems] = useState<AuthUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers({ q, page, page_size: 20 });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao listar usuários");
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void listGroups({ page_size: 100 })
      .then((g) => setGroups(g.items))
      .catch(() => undefined);
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", must_change_password: true });
    setOpen(true);
  };

  const openEdit = (user: AuthUser) => {
    setEditing(user);
    form.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      status: user.status,
      primary_group_id: user.primary_group_id,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateUser(editing.id, values);
        toast.success("Usuário atualizado");
      } else {
        await createUser(values);
        toast.success("Usuário criado");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar");
    }
  };

  const onDelete = (user: AuthUser) => {
    Modal.confirm({
      title: "Excluir usuário?",
      content: `${user.first_name} ${user.last_name} será marcado como excluído.`,
      okText: "Excluir",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await deleteUser(user.id);
        toast.success("Usuário excluído");
        await load();
      },
    });
  };

  return (
    <IamAdminShell
      title="Usuários"
      description="Gerencie contas, status e grupos."
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Novo usuário
        </Button>
      }
    >
      <IamSectionCard
        flush
        toolbar={
          <Input.Search
            placeholder="Buscar por nome, e-mail ou usuário"
            allowClear
            onSearch={(value) => {
              setPage(1);
              setQ(value);
            }}
            style={{ maxWidth: 360 }}
          />
        }
      >
        <Table<AuthUser>
          rowKey="id"
          loading={loading}
          dataSource={items}
          pagination={{
            current: page,
            total,
            pageSize: 20,
            onChange: setPage,
            showTotal: (t) => `${t} usuário(s)`,
          }}
          columns={[
            {
              title: "Nome",
              render: (_, r) => `${r.first_name} ${r.last_name}`,
            },
            { title: "Usuário", dataIndex: "username" },
            { title: "E-mail", dataIndex: "email" },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag>{s}</Tag>,
            },
            {
              title: "Admin",
              dataIndex: "is_admin",
              render: (v: boolean) => (v ? "Sim" : "Não"),
            },
            {
              title: "Ações",
              width: 120,
              render: (_, r) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    aria-label="Editar"
                    onClick={() => openEdit(r)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="Excluir"
                    onClick={() => onDelete(r)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </IamSectionCard>

      <Modal
        title={editing ? "Editar usuário" : "Novo usuário"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => void onSubmit()}
        okText="Salvar"
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item name="first_name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Sobrenome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Usuário" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="email" label="E-mail" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="Senha" rules={[{ required: true, min: 8 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="status" label="Status">
            <Select
              options={[
                { value: "active", label: "Ativo" },
                { value: "disabled", label: "Desativado" },
                { value: "blocked", label: "Bloqueado" },
              ]}
            />
          </Form.Item>
          <Form.Item name="group_ids" label="Grupos">
            <Select
              mode="multiple"
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              placeholder="Selecione grupos"
            />
          </Form.Item>
        </Form>
      </Modal>
    </IamAdminShell>
  );
}
