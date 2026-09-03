import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Section title aligned with design-system portal section headers. */
export function SectionHeading({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
        {descricao && <p className="mt-1 text-[13px] text-muted-foreground">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}
