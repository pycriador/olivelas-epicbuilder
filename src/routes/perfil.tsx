import { Alert, Button, Card, Descriptions, Form, Input } from "antd";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/auth/useAuth";
import { PageShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [{ title: "Meu perfil — Olivelas App Model" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChangePassword = async (values: {
    current_password: string;
    new_password: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      await changePassword(values);
      toast.success("Senha alterada com sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PageShell
      crumbs={[{ label: "Portal", to: "/portal" }, { label: "Meu perfil" }]}
      titulo="Meu perfil"
      descricao="Dados da conta e alteração de senha."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Dados da conta">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Nome">
              {user.first_name} {user.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Usuário">{user.username}</Descriptions.Item>
            <Descriptions.Item label="E-mail">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
            <Descriptions.Item label="Grupos">
              {user.groups.length ? user.groups.join(", ") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Administrador">{user.is_admin ? "Sim" : "Não"}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Alterar senha">
          {error && <Alert className="mb-4" type="error" showIcon message={error} />}
          <Form layout="vertical" onFinish={(v) => void onChangePassword(v)}>
            <Form.Item
              name="current_password"
              label="Senha atual"
              rules={[{ required: true, message: "Informe a senha atual" }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="new_password"
              label="Nova senha"
              rules={[
                { required: true, message: "Informe a nova senha" },
                { min: 8, message: "Mínimo de 8 caracteres" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirmar nova senha"
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Confirme a nova senha" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) return Promise.resolve();
                    return Promise.reject(new Error("As senhas não coincidem"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Salvar senha
            </Button>
          </Form>
        </Card>
      </div>
    </PageShell>
  );
}
