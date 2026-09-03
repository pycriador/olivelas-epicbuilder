import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Compact surface panel for section title + description. */
export function BalloonShell({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-px shadow-card", className)}>
      <div className={cn("rounded-[11px] bg-card px-5 py-4 sm:px-6 sm:py-5", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
