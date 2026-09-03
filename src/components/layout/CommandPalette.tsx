import {
  AuditOutlined,
  BarChartOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  FolderAddOutlined,
  GlobalOutlined,
  HomeOutlined,
  KeyOutlined,
  MailOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
  ClusterOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { usePaletteOpen } from "@/hooks/use-palette";
import { kindLabel, search } from "@/lib/search";

const basePages: {
  titulo: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { titulo: "Home", url: "/portal", icon: HomeOutlined },
  { titulo: "Projetos", url: "/cases", icon: CompassOutlined },
  { titulo: "AI Map", url: "/mapa", icon: GlobalOutlined },
  { titulo: "Impacto", url: "/impacto", icon: BarChartOutlined },
  { titulo: "AI Assistant", url: "/assistente", icon: MessageOutlined },
  { titulo: "Meu perfil", url: "/perfil", icon: UserOutlined },
];

const contentAdminPages = [
  { titulo: "Adicionar Projeto", url: "/admin/adicionar-case", icon: FolderAddOutlined },
  { titulo: "Adicionar Áreas", url: "/admin/adicionar-areas", icon: EnvironmentOutlined },
];

const iamPages = [
  { titulo: "IAM Dashboard", url: "/admin/iam", icon: DashboardOutlined },
  { titulo: "Usuários IAM", url: "/admin/iam/users", icon: UserOutlined },
  { titulo: "Grupos IAM", url: "/admin/iam/groups", icon: TeamOutlined },
  { titulo: "Roles IAM", url: "/admin/iam/roles", icon: SafetyCertificateOutlined },
  { titulo: "Permissões IAM", url: "/admin/iam/permissions", icon: KeyOutlined },
  { titulo: "Sessões IAM", url: "/admin/iam/sessions", icon: ClusterOutlined },
  { titulo: "Auditoria IAM", url: "/admin/iam/audit", icon: AuditOutlined },
  { titulo: "Convites IAM", url: "/admin/iam/invitations", icon: MailOutlined },
  { titulo: "Shares IAM", url: "/admin/iam/shares", icon: ShareAltOutlined },
  { titulo: "Configurações", url: "/admin/iam/settings", icon: SettingOutlined },
];

export function CommandPalette() {
  const [open, setOpen] = usePaletteOpen();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, isAdmin, hasPermission } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const paginas = useMemo(() => {
    const pages = [...basePages];
    if (
      isAdmin ||
      hasPermission("cases.create") ||
      hasPermission("cases.edit") ||
      hasPermission("areas.manage")
    ) {
      pages.push(...contentAdminPages);
    }
    if (isAdmin || hasPermission("iam.admin") || hasPermission("iam.users.view")) {
      pages.push(...iamPages);
    } else if (isAdmin || hasPermission("settings.manage")) {
      pages.push({
        titulo: "Configurações",
        url: "/admin/iam/settings",
        icon: SettingOutlined,
      });
    }
    return pages;
  }, [hasPermission, isAdmin]);

  if (!user) return null;

  const resultados = search(query, 12);

  const go = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Buscar cases, aulas, integrações…"
      />
      <CommandList>
        <CommandEmpty>Nada encontrado. Tente outro termo.</CommandEmpty>

        {resultados.length > 0 && (
          <CommandGroup heading="Conteúdos">
            {resultados.map((r) => (
              <CommandItem
                key={r.kind + r.id}
                value={`${r.titulo} ${r.tags.join(" ")}`}
                onSelect={() =>
                  go(() =>
                    navigate({
                      to: r.href,
                      params: r.params as never,
                    }),
                  )
                }
              >
                <span className="truncate">{r.titulo}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {kindLabel[r.kind]}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Ir para">
          {paginas.map((p) => (
            <CommandItem
              key={p.url}
              value={p.titulo}
              onSelect={() => go(() => navigate({ to: p.url }))}
            >
              <p.icon className="mr-2 text-muted-foreground" />
              {p.titulo}
            </CommandItem>
          ))}
        </CommandGroup>

        {query.trim().length > 1 && (
          <CommandGroup heading="Busca">
            <CommandItem
              value={`ver todos os resultados ${query}`}
              onSelect={() => go(() => navigate({ to: "/busca", search: { q: query.trim() } }))}
            >
              Ver todos os resultados para “{query.trim()}”
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
