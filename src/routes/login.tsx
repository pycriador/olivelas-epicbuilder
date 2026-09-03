import { EyeInvisibleOutlined, EyeOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/auth/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — AIOPS App Model" },
      { name: "description", content: "Acesse o portal de Inteligência Artificial da Loft." },
    ],
  }),
  component: LoginPage,
});

type LoginForm = {
  login: string;
  password: string;
  remember_me: boolean;
};

function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      void navigate({ to: "/portal" });
    }
  }, [authLoading, user, navigate]);

  const onFinish = async (values: LoginForm) => {
    setError(null);
    setSubmitting(true);
    try {
      await login({
        login: values.login.trim(),
        password: values.password,
        remember_me: values.remember_me,
      });
      await navigate({ to: "/portal" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
            L
          </span>
          <h1 className="mt-4 text-xl font-semibold text-foreground">AIOPS App Model</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com sua conta para acessar o portal</p>
        </div>

        {error && (
          <Alert type="error" showIcon message={error} className="mb-4" closable onClose={() => setError(null)} />
        )}

        <Form<LoginForm>
          layout="vertical"
          requiredMark={false}
          initialValues={{ remember_me: true }}
          onFinish={(v) => void onFinish(v)}
        >
          <Form.Item
            name="login"
            label="E-mail ou usuário"
            rules={[{ required: true, message: "Informe e-mail ou usuário" }]}
          >
            <Input prefix={<UserOutlined />} size="large" autoComplete="username" placeholder="nome@loft.com.br" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: "Informe a senha" }]}
          >
            <Input
              prefix={<LockOutlined />}
              size="large"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              suffix={
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="border-0 bg-transparent p-0 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              }
            />
          </Form.Item>

          <div className="mb-4 flex items-center justify-between">
            <Form.Item name="remember_me" valuePropName="checked" noStyle>
              <Checkbox>Lembrar-me</Checkbox>
            </Form.Item>
            <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
              Esqueci a senha
            </Link>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
            Entrar
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
