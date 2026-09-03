import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Badge } from "antd";
import type { ComponentType } from "react";

import type { AulaProgresso } from "@/lib/content-store";
import { cn } from "@/lib/utils";

const STYLES: Record<AulaProgresso, string> = {
  "Não iniciado": "border-2 border-border bg-secondary text-muted-foreground",
  "Em andamento":
    "border-2 border-primary/50 bg-primary/15 text-brand-deep shadow-sm shadow-primary/10",
  Concluído:
    "border-2 border-accent/55 bg-accent/15 text-accent shadow-sm shadow-accent/10",
};

const ICONS: Record<AulaProgresso, ComponentType<{ className?: string }>> = {
  "Não iniciado": MinusCircleOutlined,
  "Em andamento": ClockCircleOutlined,
  Concluído: CheckCircleOutlined,
};

const BADGE_STATUS: Record<AulaProgresso, "default" | "processing" | "success"> = {
  "Não iniciado": "default",
  "Em andamento": "processing",
  Concluído: "success",
};

export function AulaStatusBadge({
  status,
  className,
}: {
  status: AulaProgresso;
  className?: string;
}) {
  const Icon = ICONS[status];
  return (
    <Badge
      status={BADGE_STATUS[status]}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide [&_.ant-badge-status-dot]:hidden",
        STYLES[status],
        className,
      )}
      text={
        <span className="inline-flex items-center gap-1.5">
          <Icon className="shrink-0 text-xs" />
          {status}
        </span>
      }
    />
  );
}

export const AULA_STATUS_OPTIONS: AulaProgresso[] = [
  "Não iniciado",
  "Em andamento",
  "Concluído",
];

const OPTION_META: Record<
  AulaProgresso,
  {
    icon: ComponentType<{ className?: string }>;
    hint: string;
    active: string;
    idle: string;
  }
> = {
  "Não iniciado": {
    icon: MinusCircleOutlined,
    hint: "Ainda não começou",
    active: "border-foreground/25 bg-secondary text-foreground ring-2 ring-foreground/10",
    idle: "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
  },
  "Em andamento": {
    icon: ClockCircleOutlined,
    hint: "Aparece em Continue explorando",
    active: "border-primary bg-primary text-primary-foreground ring-2 ring-primary/25 shadow-md shadow-primary/20",
    idle: "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
  },
  Concluído: {
    icon: CheckCircleOutlined,
    hint: "Vai para a seção Concluído",
    active: "border-accent bg-accent text-accent-foreground ring-2 ring-accent/30 shadow-md shadow-accent/20",
    idle: "border-border bg-card text-muted-foreground hover:border-accent/40 hover:text-accent",
  },
};

export function AulaStatusPicker({
  status,
  onChange,
}: {
  status: AulaProgresso;
  onChange: (next: AulaProgresso) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-primary/35 bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-secondary/30 px-5 py-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Status da aula
          </p>
          <p className="mt-1.5 text-sm font-medium text-foreground">
            Organize onde este conteúdo aparece na AI Academy
          </p>
        </div>
        <AulaStatusBadge status={status} className="px-3 py-1.5 text-xs" />
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {AULA_STATUS_OPTIONS.map((opcao) => {
          const meta = OPTION_META[opcao];
          const Icon = meta.icon;
          const ativo = status === opcao;
          return (
            <button
              key={opcao}
              type="button"
              onClick={() => onChange(opcao)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2 rounded-2xl border px-4 py-3.5 text-left transition-all",
                ativo ? meta.active : meta.idle,
              )}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Icon className="shrink-0" />
                {opcao}
              </span>
              <span
                className={cn(
                  "text-xs leading-snug",
                  ativo ? "text-current/80" : "text-muted-foreground",
                )}
              >
                {meta.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
