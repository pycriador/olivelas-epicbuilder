/** Shared sidebar/nav item definitions gated by IAM permissions. */

export type NavPermissionGate = {
  isAdmin: boolean;
  hasPermission: (code: string) => boolean;
};

export type NavItemDef = {
  key: string;
  label: string;
};

export type AppNavItem = NavItemDef & {
  description: string;
};

/** Primary app sections shown in the 9-dot launcher and sidebar. */
export const PRINCIPAL_APP_ITEMS: AppNavItem[] = [
  {
    key: "/portal",
    label: "Home",
    description: "Página inicial do portal Olivelas.",
  },
  {
    key: "/cases",
    label: "Projetos",
    description: "Cases e projetos de IA da Olivelas.",
  },
  {
    key: "/mapa",
    label: "AI Map",
    description: "Mapa de iniciativas e capacidades de IA.",
  },
  {
    key: "/impacto",
    label: "Impacto",
    description: "Métricas e resultados dos projetos de IA.",
  },
  {
    key: "/assistente",
    label: "Assistente",
    description: "Assistente conversacional para explorar o portal.",
  },
  {
    key: "/ferramentas",
    label: "Integrações",
    description: "Ferramentas e integrações disponíveis.",
  },
];

const SECTION_LABELS: Record<string, string> = {
  "/portal": "Home",
  "/cases": "Projetos",
  "/mapa": "AI Map",
  "/impacto": "Impacto",
  "/assistente": "Assistente",
  "/ferramentas": "Integrações",
  "/admin/adicionar-case": "Adicionar Projeto",
  "/admin/adicionar-areas": "Adicionar Áreas",
  "/admin/iam": "IAM",
  "/perfil": "Meu perfil",
};

/** Breadcrumb label for the current route in the top bar. */
export function getCurrentSectionLabel(pathname: string): string {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (normalized === "/" || normalized === "/portal") return "Home";

  const iamMatch = IAM_SECTION_LABELS[normalized];
  if (iamMatch) return iamMatch;

  if (normalized.startsWith("/admin/iam")) return "IAM";

  const exact = SECTION_LABELS[normalized];
  if (exact) return exact;

  const prefix = Object.keys(SECTION_LABELS)
    .filter((key) => key !== "/portal")
    .sort((a, b) => b.length - a.length)
    .find((key) => normalized.startsWith(key));

  return prefix ? SECTION_LABELS[prefix]! : "Olivelas Central";
}

const IAM_SECTION_LABELS: Record<string, string> = {
  "/admin/iam": "IAM Dashboard",
  "/admin/iam/users": "Usuários",
  "/admin/iam/groups": "Grupos",
  "/admin/iam/roles": "Roles",
  "/admin/iam/permissions": "Permissões",
  "/admin/iam/sessions": "Sessões",
  "/admin/iam/audit": "Auditoria",
  "/admin/iam/invitations": "Convites",
  "/admin/iam/shares": "Shares",
  "/admin/iam/settings": "Configurações",
};

/** Compact admin items for the app launcher (gated). */
export function buildAdminLauncherItems({
  isAdmin,
  hasPermission,
}: NavPermissionGate): AppNavItem[] {
  const items: AppNavItem[] = [];

  for (const item of buildContentAdminItems({ isAdmin, hasPermission })) {
    items.push({
      ...item,
      description:
        item.key === "/admin/adicionar-case"
          ? "Cadastrar novo case ou projeto."
          : "Gerenciar áreas do portal.",
    });
  }

  if (buildIamItems({ isAdmin, hasPermission }).length > 0) {
    items.push({
      key: "/admin/iam",
      label: "IAM",
      description: "Identidade, acesso e auditoria.",
    });
  }

  return items;
}

/** Content-admin shortcuts (Adicionar Projeto / Áreas). */
export function buildContentAdminItems({
  isAdmin,
  hasPermission,
}: NavPermissionGate): NavItemDef[] {
  const items: NavItemDef[] = [];
  if (isAdmin || hasPermission("cases.create") || hasPermission("cases.edit")) {
    items.push({ key: "/admin/adicionar-case", label: "Adicionar Projeto" });
  }
  if (isAdmin || hasPermission("areas.manage")) {
    items.push({ key: "/admin/adicionar-areas", label: "Adicionar Áreas" });
  }
  return items;
}

/** IAM admin section — same gates as AppShell. */
export function buildIamItems({ isAdmin, hasPermission }: NavPermissionGate): NavItemDef[] {
  if (
    !isAdmin &&
    !hasPermission("iam.admin") &&
    !hasPermission("iam.users.view") &&
    !hasPermission("settings.manage")
  ) {
    return [];
  }

  const items: NavItemDef[] = [];
  if (isAdmin || hasPermission("iam.admin") || hasPermission("iam.users.view")) {
    items.push({ key: "/admin/iam", label: "IAM Dashboard" });
  }
  if (isAdmin || hasPermission("iam.users.view") || hasPermission("iam.users.manage")) {
    items.push({ key: "/admin/iam/users", label: "Usuários" });
  }
  if (isAdmin || hasPermission("iam.groups.manage")) {
    items.push({ key: "/admin/iam/groups", label: "Grupos" });
  }
  if (isAdmin || hasPermission("iam.roles.manage")) {
    items.push({ key: "/admin/iam/roles", label: "Roles" });
  }
  if (isAdmin || hasPermission("iam.permissions.manage")) {
    items.push({ key: "/admin/iam/permissions", label: "Permissões" });
  }
  if (isAdmin || hasPermission("iam.sessions.manage")) {
    items.push({ key: "/admin/iam/sessions", label: "Sessões" });
  }
  if (isAdmin || hasPermission("iam.audit.view")) {
    items.push({ key: "/admin/iam/audit", label: "Auditoria" });
  }
  if (isAdmin || hasPermission("iam.invitations.manage")) {
    items.push({ key: "/admin/iam/invitations", label: "Convites" });
  }
  if (isAdmin || hasPermission("iam.shares.manage")) {
    items.push({ key: "/admin/iam/shares", label: "Shares" });
  }
  if (isAdmin || hasPermission("settings.manage") || hasPermission("iam.admin")) {
    items.push({ key: "/admin/iam/settings", label: "Configurações" });
  }
  return items;
}
