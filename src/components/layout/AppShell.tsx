import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  KeyOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PlusSquareOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
  ClusterOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Layout, Menu, Spin, theme } from "antd";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/auth/useAuth";
import { AppLauncher } from "@/components/layout/AppLauncher";
import { isPublicPath } from "@/lib/auth-guard";
import { filterIamAdminNav, groupIamAdminNav, IAM_NAV_GROUP_LABELS } from "@/lib/iam-admin-nav";
import {
  buildContentAdminItems,
  getCurrentSectionLabel,
  PRINCIPAL_APP_ITEMS,
} from "@/lib/nav-items";
import { colors } from "@/theme/tokens";

const { Header, Sider, Content } = Layout;

const contentAdminIcons: Record<string, ReactNode> = {
  "/admin/adicionar-case": <PlusSquareOutlined />,
  "/admin/adicionar-areas": <EnvironmentOutlined />,
};

const iamIcons: Record<string, ReactNode> = {
  "/admin/iam": <DashboardOutlined />,
  "/admin/iam/users": <UserOutlined />,
  "/admin/iam/groups": <TeamOutlined />,
  "/admin/iam/roles": <SafetyCertificateOutlined />,
  "/admin/iam/permissions": <KeyOutlined />,
  "/admin/iam/sessions": <ClusterOutlined />,
  "/admin/iam/audit": <AuditOutlined />,
  "/admin/iam/invitations": <MailOutlined />,
  "/admin/iam/shares": <ShareAltOutlined />,
  "/admin/iam/settings": <SettingOutlined />,
};

const principalIcons: Record<string, ReactNode> = {
  "/portal": <HomeOutlined />,
  "/cases": <CompassOutlined />,
  "/mapa": <EnvironmentOutlined />,
  "/impacto": <BarChartOutlined />,
  "/assistente": <MessageOutlined />,
  "/ferramentas": <AppstoreOutlined />,
};

function selectedKey(pathname: string, keys: string[]): string {
  if (pathname === "/portal" || pathname === "/") return "/portal";
  const match = keys
    .filter((key) => key !== "/portal")
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));
  return match ?? pathname;
}

/** Application chrome aligned with aiops-loft-design-system AppShell (light surfaces). */
export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const savedMenuScrollTop = useRef(0);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { token } = theme.useToken();
  const { user, loading, logout, hasPermission, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isPublicPath(pathname)) return;
    if (!user) {
      void navigate({ to: "/login" });
    }
  }, [loading, user, pathname, navigate]);

  useLayoutEffect(() => {
    const el = menuScrollRef.current;
    if (!el) return;

    const top = savedMenuScrollTop.current;
    el.scrollTop = top;
    requestAnimationFrame(() => {
      el.scrollTop = top;
    });
  }, [pathname]);

  const principalItems = useMemo(
    () =>
      PRINCIPAL_APP_ITEMS.map((item) => ({
        key: item.key,
        icon: principalIcons[item.key],
        label: item.label,
      })),
    [],
  );

  const contentAdminItems = useMemo(
    () =>
      buildContentAdminItems({ isAdmin, hasPermission }).map((item) => ({
        ...item,
        icon: contentAdminIcons[item.key],
      })),
    [hasPermission, isAdmin],
  );

  const iamNavGroups = useMemo(
    () => groupIamAdminNav(filterIamAdminNav({ isAdmin, hasPermission })),
    [hasPermission, isAdmin],
  );

  const iamKeys = useMemo(
    () => iamNavGroups.flatMap((group) => group.items.map((item) => item.key)),
    [iamNavGroups],
  );

  const allKeys = [
    ...principalItems.map((i) => i.key),
    ...contentAdminItems.map((i) => i.key),
    ...iamKeys,
    "/perfil",
  ];

  const sectionLabel = getCurrentSectionLabel(pathname);

  if (loading && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))]">
        <Spin size="large" description="Carregando sessão…" />
      </div>
    );
  }

  if (!user && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))]">
        <Spin size="large" description="Redirecionando…" />
      </div>
    );
  }

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : "";

  const iamMenuGroups = iamNavGroups.map((group) => ({
    type: "group" as const,
    label: collapsed ? null : IAM_NAV_GROUP_LABELS[group.id],
    children: group.items.map((item) => ({
      key: item.key,
      icon: iamIcons[item.key],
      label: item.label,
    })),
  }));

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1020,
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorder}`,
          paddingInline: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          lineHeight: "normal",
        }}
      >
        <div className="flex h-full min-w-0 items-center gap-2">
          <Link
            to="/portal"
            className="shrink-0 text-xl font-bold tracking-tight text-[#F56738] no-underline hover:no-underline"
            aria-label="AIOps Central — página inicial"
          >
            AIOps Central
          </Link>
          <span className="hidden text-[#878D96] sm:inline" aria-hidden>
            /
          </span>
          <span className="hidden truncate text-sm font-medium text-[#121619] sm:inline">
            {sectionLabel}
          </span>
          <AppLauncher />
        </div>

        <div className="flex h-full items-center gap-1">
          {user && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: "Meu perfil",
                    onClick: () => void navigate({ to: "/perfil" }),
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Sair",
                    danger: true,
                    onClick: () => void logout().then(() => navigate({ to: "/login" })),
                  },
                ],
              }}
            >
              <Button type="text" className="inline-flex items-center gap-2">
                <Avatar size="small" src={user.photo_url ?? undefined} icon={<UserOutlined />} />
                <span className="hidden sm:inline">{displayName || user.email}</span>
              </Button>
            </Dropdown>
          )}
        </div>
      </Header>

      <Layout
        style={{
          height: "calc(100vh - 56px)",
          overflow: "hidden",
          background: "color-mix(in oklab, #F2F4F8 60%, #FFFFFF)",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={248}
          breakpoint="lg"
          collapsedWidth={64}
          onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
          }}
          style={{
            background: colors.background.page,
            borderRight: `1px solid ${colors.border.default}`,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div className="flex h-full flex-col overflow-hidden">
            <div className="hidden shrink-0 border-b border-[#DDE1E6] px-4 py-3 lg:block">
              <Button
                type="text"
                block
                className="!flex !items-center !justify-start !gap-2 !px-2"
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((v) => !v)}
              >
                {!collapsed ? <span className="text-sm text-[#4D5358]">Recolher menu</span> : null}
              </Button>
            </div>

            <div
              ref={menuScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              onScroll={(event) => {
                savedMenuScrollTop.current = event.currentTarget.scrollTop;
              }}
            >
              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[selectedKey(pathname, allKeys)]}
                style={{ background: "transparent", borderInlineEnd: "none", marginTop: 8 }}
                onClick={({ key }) => {
                  void navigate({ to: key });
                }}
                items={[
                  ...principalItems,
                  ...(contentAdminItems.length
                    ? [
                        { type: "divider" as const },
                        {
                          type: "group" as const,
                          label: collapsed ? null : "Conteúdo",
                          children: contentAdminItems,
                        },
                      ]
                    : []),
                  ...(iamMenuGroups.length ? [{ type: "divider" as const }, ...iamMenuGroups] : []),
                ]}
              />
            </div>
          </div>
        </Sider>

        <Content style={{ minHeight: 0, overflow: "auto" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
