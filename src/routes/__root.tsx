import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Button, Result, Spin } from "antd";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { OldAppShell } from "@/components/layout/old/OldAppShell";
import { PortalApiStatusBanner } from "@/components/layout/PortalApiStatusBanner";
import { LayoutModeProvider, useLayoutMode } from "@/layout/LayoutModeProvider";
import { isPublicPath, shouldUseAppShell } from "@/lib/auth-guard";
import { LoftProvider } from "@/theme/LoftProvider";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] px-4">
      <Result
        status="404"
        title="Página não encontrada"
        subTitle="A página que você procura não existe ou foi movida."
        extra={
          <Link to="/">
            <Button type="primary">Ir para a home</Button>
          </Link>
        }
      />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))] px-4">
      <Result
        status="error"
        title="Esta página não carregou"
        subTitle="Algo deu errado. Tente novamente ou volte para a home."
        extra={[
          <Button
            type="primary"
            key="retry"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Tentar novamente
          </Button>,
          <Link to="/" key="home">
            <Button>Ir para a home</Button>
          </Link>,
        ]}
      />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Olivelas App Model — Olivelas" },
      {
        name: "description",
        content:
          "Portal interno de Inteligência Artificial da Olivelas: cases, trilhas, ferramentas, templates e prompts em um só lugar.",
      },
      { property: "og:title", content: "Olivelas App Model — Olivelas" },
      {
        property: "og:description",
        content: "Descubra, aprenda e construa com IA na Olivelas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppFrame({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isClassic, ready: layoutReady } = useLayoutMode();
  const withShell = shouldUseAppShell(pathname, Boolean(user));

  useEffect(() => {
    if (loading) return;
    if (isPublicPath(pathname)) return;
    if (!user) {
      void navigate({ to: "/login" });
    }
  }, [loading, user, pathname, navigate]);

  if (loading && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" description="Carregando…" />
      </div>
    );
  }

  if (!user && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" description="Redirecionando…" />
      </div>
    );
  }

  if (withShell && !layoutReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" description="Carregando…" />
      </div>
    );
  }

  if (withShell && isClassic) {
    return <OldAppShell>{children}</OldAppShell>;
  }

  if (withShell) {
    return (
      <AppShell>
        <PortalApiStatusBanner />
        {children}
      </AppShell>
    );
  }

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LoftProvider>
        <AuthProvider>
          <LayoutModeProvider>
            <AppFrame>
              <Outlet />
            </AppFrame>
            <CommandPalette />
            <Toaster position="bottom-right" />
          </LayoutModeProvider>
        </AuthProvider>
      </LoftProvider>
    </QueryClientProvider>
  );
}
