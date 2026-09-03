import { CheckOutlined } from "@ant-design/icons";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import { buildAdminLauncherItems, PRINCIPAL_APP_ITEMS, type AppNavItem } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

function WaffleDots() {
  const dotSize = 5;
  const gap = 5;

  return (
    <span
      className="inline-grid"
      style={{
        gridTemplateColumns: `repeat(3, ${dotSize}px)`,
        gridTemplateRows: `repeat(3, ${dotSize}px)`,
        gap,
      }}
      aria-hidden
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className="block rounded-[1px] bg-current"
          style={{ width: dotSize, height: dotSize }}
        />
      ))}
    </span>
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

function ProductCard({
  item,
  active,
  onNavigate,
}: {
  item: AppNavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={item.key as never}
      role="menuitem"
      onClick={onNavigate}
      className={cn(
        "flex flex-col gap-px rounded-lg border px-3 py-[7px] text-[#191F23] transition-colors",
        active
          ? "border-[#B7E9C6] bg-[#EAF9EF]"
          : "border-[#DDE1E6] hover:border-[#C5CBD0] hover:bg-[#F2F4F8]",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#0B6B4F]">{item.label}</span>
        {active ? (
          <span
            className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#2ECC71] text-white"
            aria-label="Área atual"
          >
            <CheckOutlined style={{ fontSize: 10 }} />
          </span>
        ) : (
          <span
            className="text-[#8A9197] transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        )}
      </span>
      <span className="text-xs leading-tight text-[#4D5358]">{item.description}</span>
    </Link>
  );
}

function ProductMini({ item, onNavigate }: { item: AppNavItem; onNavigate: () => void }) {
  return (
    <Link
      to={item.key as never}
      role="menuitem"
      onClick={onNavigate}
      className="flex items-center gap-2.5 rounded-lg border border-[#DDE1E6] px-2.5 py-[9px] text-[13px] font-medium text-[#191F23] transition-colors hover:border-[#C5CBD0] hover:bg-[#F2F4F8]"
    >
      <span className="relative h-2.5 w-[15px] shrink-0" aria-hidden>
        <span className="absolute left-0 top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border-[1.6px] border-[#FF774A] bg-white" />
        <span className="absolute left-2 top-1/2 h-0.5 w-[7px] -translate-y-1/2 bg-[#FF774A]" />
      </span>
      {item.label}
    </Link>
  );
}

/** Google-style 9-dot app launcher for primary navigation areas. */
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
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-[#4D5358] transition-colors hover:bg-[#F2F4F8]",
          open && "bg-[#F2F4F8]",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu de áreas do AIOps Central"
        onClick={() => setOpen((value) => !value)}
      >
        <WaffleDots />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Áreas do AIOps Central"
          className="fixed left-6 top-14 z-[1020] flex max-h-[calc(100vh-56px-12px)] w-[460px] max-w-[calc(100vw-48px)] flex-col overflow-y-auto rounded-xl bg-white p-6 text-[#191F23] shadow-[0_16px_40px_rgba(25,31,35,0.18)]"
        >
          <p className="mb-4 text-base text-[#4D5358]">
            Áreas do <strong className="font-semibold text-[#191F23]">AIOps Central</strong>
          </p>

          <ul className="mb-2 grid grid-cols-2 gap-2" role="none">
            {PRINCIPAL_APP_ITEMS.map((item) => (
              <li key={item.key} role="none" className="group">
                <ProductCard
                  item={item}
                  active={isActiveRoute(pathname, item.key)}
                  onNavigate={close}
                />
              </li>
            ))}
          </ul>

          {adminItems.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2" role="none">
              {adminItems.map((item) => (
                <li key={item.key} role="none">
                  <ProductMini item={item} onNavigate={close} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
