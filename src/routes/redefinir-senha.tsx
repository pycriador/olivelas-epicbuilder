import { Alert, Button, Form, Input } from "antd";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { resetPassword } from "@/lib/auth-api";

export const Route = createFileRoute("/redefinir-senha")({
  validateSearch: (search: Record<string, unknown>): { token?: string } =>
    typeof search["token"] === "string" && search["token"]
      ? { token: search["token"] as string }
      : {},
  head: () => ({
    meta: [{ title: "Redefinir senha — AIOPS App Model" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { password: string; confirm: string }) => {
    if (!token) {
      setError("Token de redefinição ausente. Use o link enviado por e-mail.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ token, new_password: values.password });
      await navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
          L
        </span>
        <h1 className="mt-4 text-center text-xl font-semibold">Redefinir senha</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Escolha uma nova senha com pelo menos 8 caracteres.
        </p>

        {error && <Alert className="mt-4" type="error" showIcon message={error} />}
        {!token && (
          <Alert className="mt-4" type="warning" showIcon message="Token ausente na URL. Solicite um novo link." />
        )}

        <Form layout="vertical" className="mt-6" onFinish={(v) => void onFinish(v)}>
          <Form.Item
            name="password"
            label="Nova senha"
            rules={[
              { required: true, message: "Informe a nova senha" },
              { min: 8, message: "Mínimo de 8 caracteres" },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirmar senha"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Confirme a senha" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) return Promise.resolve();
                  return Promise.reject(new Error("As senhas não coincidem"));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} disabled={!token}>
            Salvar nova senha
          </Button>
          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
