import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type IamSectionCardProps = {
  title?: string;
  description?: ReactNode;
  extra?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  /** Remove inner padding — use for tables flush to card edges. */
  flush?: boolean;
  className?: string;
};

/** Elevated section panel for IAM admin pages. */
export function IamSectionCard({
  title,
  description,
  extra,
  toolbar,
  children,
  flush = false,
  className,
}: IamSectionCardProps) {
  const hasHeader = Boolean(title || description || extra);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgb(25_31_35/0.04),0_8px_24px_-12px_rgb(25_31_35/0.12)]",
        className,
      )}
    >
      {hasHeader && (
        <header className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-[15px] font-semibold text-foreground">{title}</h2> : null}
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {extra ? <div className="flex shrink-0 flex-wrap gap-2">{extra}</div> : null}
        </header>
      )}
      {toolbar ? (
        <div className="border-b border-border/70 bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] px-5 py-3">
          {toolbar}
        </div>
      ) : null}
      <div className={cn(!flush && "p-5")}>{children}</div>
    </section>
  );
}
