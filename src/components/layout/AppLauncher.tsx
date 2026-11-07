import {
  AppstoreOutlined,
  BarChartOutlined,
  CheckOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MessageOutlined,
  PlusSquareOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useAuth } from "@/auth/useAuth";
import { buildAdminLauncherItems, PRINCIPAL_APP_ITEMS, type AppNavItem } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

const LAUNCHER_ICONS: Record<string, ReactNode> = {
  "/portal": <HomeOutlined />,
  "/cases": <CompassOutlined />,
  "/mapa": <EnvironmentOutlined />,
  "/impacto": <BarChartOutlined />,
  "/assistente": <MessageOutlined />,
  "/ferramentas": <AppstoreOutlined />,
  "/admin/adicionar-case": <PlusSquareOutlined />,
  "/admin/adicionar-areas": <EnvironmentOutlined />,
  "/admin/iam": <SafetyCertificateOutlined />,
};

function AppGridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {[
        [3, 3],
        [8, 3],
        [13, 3],
        [3, 8],
        [8, 8],
        [13, 8],
        [3, 13],
        [8, 13],
        [13, 13],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.75" fill="currentColor" />
      ))}
    </svg>
  );
}

function isActiveRoute(pathname: string, href: string): boolean {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (href === "/portal") {
    return normalized === "/portal" || normalized === "/";
  }
  if (href === "/admin/iam") {
    return normalized === "/admin/iam" || normalized.startsWith("/admin/iam/");
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

function LauncherTile({
  item,
  active,
  onNavigate,
}: {
  item: AppNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const icon = LAUNCHER_ICONS[item.key];

  return (
    <Link
      to={item.key as never}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "group flex items-start gap-3 rounded-lg border p-3 transition-all duration-150",
        active
          ? "border-[color-mix(in_oklab,#20A483_35%,#E1E9EF)] bg-[#E8F5F0] shadow-[inset_0_0_0_1px_color-mix(in_oklab,#20A483_12%,transparent)]"
          : "border-[#E1E9EF] bg-white hover:border-[#C1C7CD] hover:bg-[#F2F4F8]",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-base transition-colors",
          active
            ? "bg-white text-[#20A483] shadow-sm"
            : "bg-[#FFF2EC] text-[#F56738] group-hover:bg-[#FFD9C7]",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold leading-tight text-[#121619]">
            {item.label}
          </span>
          {active ? (
            <span
              className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#F56738] text-white"
              aria-label="Área atual"
            >
              <CheckOutlined style={{ fontSize: 10 }} />
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#697077]">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function AdminMenuItem({ item, onNavigate }: { item: AppNavItem; onNavigate: () => void }) {
  const icon = LAUNCHER_ICONS[item.key];

  return (
    <Link
      to={item.key as never}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-[#121619] transition-colors hover:bg-[#F2F4F8]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#FFF2EC] text-[#F56738]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate">{item.label}</span>
        <span className="block truncate text-xs font-normal text-[#697077]">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

/** Copan-styled app launcher for primary navigation areas. */
export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, hasPermission } = useAuth();

  const adminItems = buildAdminLauncherItems({ isAdmin, hasPermission });

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="relative flex shrink-0 items-center self-center">
      <button
        type="button"
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white p-0 transition-all duration-150",
          open
            ? "border-[#E1E9EF] text-[#121619] shadow-[0_2px_6px_rgba(25,31,35,0.08)]"
            : "border-transparent text-[#697077] hover:border-[#E1E9EF] hover:bg-[#F2F4F8] hover:text-[#121619]",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu de áreas do Olivelas Central"
        onClick={() => setOpen((value) => !value)}
      >
        <AppGridIcon />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Áreas do Olivelas Central"
          className="absolute left-0 top-[calc(100%+8px)] z-[1020] w-[min(400px,calc(100vw-48px))] overflow-hidden rounded-xl border border-[#E1E9EF] bg-white shadow-[0_24px_48px_-12px_rgba(25,31,35,0.24)]"
        >
          <div className="border-b border-[#E1E9EF] bg-[#F2F4F8] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#697077]">
              Navegação
            </p>
            <p className="mt-0.5 text-base font-semibold text-[#121619]">Olivelas Central</p>
          </div>

          <div className="max-h-[min(480px,calc(100vh-120px))] overflow-y-auto p-3">
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#697077]">
              Principais áreas
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="none">
              {PRINCIPAL_APP_ITEMS.map((item) => (
                <li key={item.key} role="none">
                  <LauncherTile
                    item={item}
                    active={isActiveRoute(pathname, item.key)}
                    onNavigate={close}
                  />
                </li>
              ))}
            </ul>

            {adminItems.length > 0 ? (
              <>
                <div className="my-3 h-px bg-[#E1E9EF]" role="separator" />
                <p className="mb-1 px-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#697077]">
                  Administração
                </p>
                <ul className="space-y-0.5" role="none">
                  {adminItems.map((item) => (
                    <li key={item.key} role="none">
                      <AdminMenuItem item={item} onNavigate={close} />
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
