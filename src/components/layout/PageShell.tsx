import { Breadcrumb } from "antd";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string>;
}

/**
 * Page chrome aligned with aiops-loft-design-system PageContainer + PageHeader:
 * soft page surface, light typography hierarchy, no dark full-bleed banner.
 */
export function PageShell({
  crumbs,
  eyebrow,
  titulo,
  descricao,
  acoes,
  children,
  larguraTotal,
  maxLargura = "max-w-6xl",
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  titulo?: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  larguraTotal?: boolean;
  maxLargura?: string;
}) {
  return (
    <div className="min-h-full bg-[color-mix(in_oklab,var(--muted)_60%,var(--background))]">
      <div
        className={
          larguraTotal
            ? "w-full px-4 py-6 md:px-6 md:py-8 xl:px-8"
            : `mx-auto w-full ${maxLargura} px-4 py-6 md:px-6 md:py-8 xl:px-8`
        }
      >
        {(crumbs?.length || titulo || acoes || eyebrow || descricao) && (
          <header className="mb-6 flex flex-col gap-4 md:mb-8">
            {crumbs && crumbs.length > 0 && (
              <Breadcrumb
                className="[&_.ant-breadcrumb-link]:text-muted-foreground [&_.ant-breadcrumb-separator]:text-muted-foreground/60 [&_a]:text-muted-foreground [&_a:hover]:text-primary [&_span]:text-foreground"
                items={crumbs.map((c, i) => ({
                  title:
                    c.to && i < crumbs.length - 1 ? (
                      <Link to={c.to} params={c.params as never}>
                        {c.label}
                      </Link>
                    ) : (
                      c.label
                    ),
                }))}
              />
            )}

            {(titulo || acoes || eyebrow || descricao) && (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  {eyebrow && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      {eyebrow}
                    </p>
                  )}
                  {titulo && (
                    <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
                      {titulo}
                    </h1>
                  )}
                  {descricao && (
                    <div className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                      {descricao}
                    </div>
                  )}
                </div>
                {acoes && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
              </div>
            )}
          </header>
        )}

        {children}
      </div>
    </div>
  );
}
