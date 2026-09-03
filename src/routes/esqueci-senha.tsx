import { Alert, Button, Form, Input } from "antd";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { forgotPassword } from "@/lib/auth-api";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [{ title: "Esqueci a senha — AIOps App Model" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { email: string }) => {
    setError(null);
    setLoading(true);
    try {
      const result = await forgotPassword(values.email.trim());
      setDone(true);
      if (result.reset_token) setDevToken(result.reset_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao solicitar redefinição");
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
        <h1 className="mt-4 text-center text-xl font-semibold">Esqueci a senha</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Informe seu e-mail para receber o link de redefinição.
        </p>

        {error && <Alert className="mt-4" type="error" showIcon message={error} />}

        {done ? (
          <div className="mt-6 space-y-3">
            <Alert
              type="success"
              showIcon
              message="Se o e-mail existir, um link de redefinição foi gerado."
            />
            {devToken && (
              <Alert
                type="info"
                showIcon
                message="Token de desenvolvimento"
                description={
                  <Link to="/redefinir-senha" search={{ token: devToken }} className="text-primary">
                    Abrir redefinição com token
                  </Link>
                }
              />
            )}
            <Link to="/login">
              <Button block type="primary">
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <Form layout="vertical" className="mt-6" onFinish={(v) => void onFinish(v)}>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: "Informe o e-mail" },
                { type: "email", message: "E-mail inválido" },
              ]}
            >
              <Input size="large" type="email" placeholder="nome@loft.com.br" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Enviar link
            </Button>
            <p className="mt-4 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </p>
          </Form>
        )}
      </div>
    </div>
  );
}
