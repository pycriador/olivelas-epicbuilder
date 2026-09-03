import type { ReactNode } from "react";

import { buildIamItems, type NavItemDef, type NavPermissionGate } from "@/lib/nav-items";

export type IamNavItem = {
  key: string;
  label: string;
  group: "overview" | "identity" | "access" | "platform";
};

/** IAM admin sub-navigation — keys must match AppShell IAM routes. */
export const IAM_ADMIN_NAV: IamNavItem[] = [
  { key: "/admin/iam", label: "Dashboard", group: "overview" },
  { key: "/admin/iam/users", label: "Usuários", group: "identity" },
  { key: "/admin/iam/groups", label: "Grupos", group: "identity" },
  { key: "/admin/iam/invitations", label: "Convites", group: "identity" },
  { key: "/admin/iam/roles", label: "Roles", group: "access" },
  { key: "/admin/iam/permissions", label: "Permissões", group: "access" },
  { key: "/admin/iam/sessions", label: "Sessões", group: "access" },
  { key: "/admin/iam/shares", label: "Shares", group: "access" },
  { key: "/admin/iam/audit", label: "Auditoria", group: "platform" },
  { key: "/admin/iam/settings", label: "Configurações", group: "platform" },
];

export const IAM_NAV_GROUP_LABELS: Record<IamNavItem["group"], string> = {
  overview: "Visão geral",
  identity: "Identidade",
  access: "Acesso",
  platform: "Plataforma",
};

export function filterIamAdminNav(gate: NavPermissionGate): IamNavItem[] {
  const allowed = new Set(buildIamItems(gate).map((item: NavItemDef) => item.key));
  allowed.add("/admin/iam");
  return IAM_ADMIN_NAV.filter((item) => allowed.has(item.key));
}

export function isIamNavActive(pathname: string, href: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (href === "/admin/iam") {
    return normalized === "/admin/iam";
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

export type IamNavGroup = {
  id: IamNavItem["group"];
  label: string;
  items: IamNavItem[];
};

export function groupIamAdminNav(items: IamNavItem[]): IamNavGroup[] {
  const order: IamNavItem["group"][] = ["overview", "identity", "access", "platform"];
  return order
    .map((id) => ({
      id,
      label: IAM_NAV_GROUP_LABELS[id],
      items: items.filter((item) => item.group === id),
    }))
    .filter((group) => group.items.length > 0);
}

export type IamNavIconMap = Record<string, ReactNode>;
