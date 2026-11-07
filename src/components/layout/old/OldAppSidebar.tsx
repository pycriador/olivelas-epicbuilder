import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Compass,
  FolderPlus,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  MapPinned,
  Network,
  Plug,
  ScrollText,
  Settings,
  Share2,
  Shield,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

import loftLogo from "@/assets/loft-logo.png";
import { useAuth } from "@/auth/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { buildContentAdminItems, buildIamItems } from "@/lib/nav-items";

/** Classic print nav — Home is `/portal` under classic layout mode. */
const principal: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "Home", url: "/portal", icon: Home },
  { title: "Projetos", url: "/cases", icon: Compass },
  { title: "AI Map", url: "/mapa", icon: Map },
  { title: "Impacto", url: "/impacto", icon: BarChart3 },
  { title: "Integrações", url: "/ferramentas", icon: Plug },
];

const contentAdminIcons: Record<string, LucideIcon> = {
  "/admin/adicionar-case": FolderPlus,
  "/admin/adicionar-areas": MapPinned,
};

const iamIcons: Record<string, LucideIcon> = {
  "/admin/iam": LayoutDashboard,
  "/admin/iam/users": UserRound,
  "/admin/iam/groups": Users,
  "/admin/iam/roles": Shield,
  "/admin/iam/permissions": KeyRound,
  "/admin/iam/sessions": Network,
  "/admin/iam/audit": ScrollText,
  "/admin/iam/invitations": Mail,
  "/admin/iam/shares": Share2,
  "/admin/iam/settings": Settings,
};

/** Lovable-era sidebar chrome for classic layout mode. */
export function OldAppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout, hasPermission, isAdmin } = useAuth();

  const isActive = (url: string) => {
    if (url === "/portal") return pathname === "/portal" || pathname === "/old";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const contentAdminItems = useMemo(
    () => buildContentAdminItems({ isAdmin, hasPermission }),
    [hasPermission, isAdmin],
  );
  const iamItems = useMemo(
    () => buildIamItems({ isAdmin, hasPermission }),
    [hasPermission, isAdmin],
  );

  const renderItems = (items: { title: string; url: string; icon: LucideIcon }[]) => (
    <SidebarMenu className="gap-1.5">
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.url)}
            tooltip={item.title}
            className="nav-pill h-10 rounded-full px-2 data-[active=true]:border-primary/55 data-[active=true]:bg-[oklch(1_0_0/0.1)]"
          >
            <Link to={item.url} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sidebar-border/70 bg-sidebar-accent/40">
                <item.icon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate text-sm">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const initials = displayName
    ? displayName
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
    : (user?.email?.slice(0, 2).toUpperCase() ?? "?");

  return (
    <Sidebar collapsible="icon" className="sidebar-aurora sidebar-edge overflow-hidden border-r-0">
      <img
        src={loftLogo}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1 w-64 opacity-[0.08] blur-[0.5px]"
      />
      <SidebarHeader className="relative border-b border-sidebar-border/60 px-3 py-4">
        <Link to="/portal" className="flex min-w-0 items-center gap-2.5">
          <img
            src={loftLogo}
            alt="Olivelas"
            className="h-8 w-auto shrink-0 object-contain"
            loading="eager"
          />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-semibold leading-tight text-sidebar-foreground">
                Olivelas App Model
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60">
                Olivelas
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="relative pt-3">
        <SidebarGroup>
          <SidebarGroupContent>{renderItems(principal)}</SidebarGroupContent>
        </SidebarGroup>

        {contentAdminItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">
                Adicionar
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              {renderItems(
                contentAdminItems.map((item) => ({
                  title: item.label,
                  url: item.key,
                  icon: contentAdminIcons[item.key] ?? FolderPlus,
                })),
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {iamItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/60">
                IAM
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              {renderItems(
                iamItems.map((item) => ({
                  title: item.label,
                  url: item.key,
                  icon: iamIcons[item.key] ?? Shield,
                })),
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {user && (
        <SidebarFooter className="relative border-t border-sidebar-border/40 bg-transparent p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 rounded-full px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent/40"
              >
                <Avatar className="h-8 w-8 border border-sidebar-border/70">
                  {user.photo_url ? <AvatarImage src={user.photo_url} alt="" /> : null}
                  <AvatarFallback className="bg-accent text-[11px] font-medium text-accent-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <span className="min-w-0 text-left">
                    <span className="block truncate text-sm font-medium">
                      {displayName || user.email}
                    </span>
                    {displayName ? (
                      <span className="block truncate text-[11px] text-sidebar-foreground/60">
                        {user.email}
                      </span>
                    ) : null}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem onClick={() => void navigate({ to: "/perfil" })}>
                <UserRound className="h-4 w-4" />
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => void logout().then(() => navigate({ to: "/login" }))}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
