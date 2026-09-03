import { Card, Input } from "antd";
import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const { TextArea } = Input;

const SECTION_TONES = [
  { bg: "bg-primary/15", ring: "ring-primary/25", text: "text-primary", bar: "bg-primary" },
  { bg: "bg-premium/15", ring: "ring-premium/25", text: "text-premium", bar: "bg-premium" },
  { bg: "bg-brand-deep/15", ring: "ring-brand-deep/25", text: "text-brand-deep", bar: "bg-brand-deep" },
  { bg: "bg-success/15", ring: "ring-success/25", text: "text-foreground", bar: "bg-success" },
  { bg: "bg-secondary", ring: "ring-border", text: "text-ink", bar: "bg-muted-foreground" },
  { bg: "bg-info/15", ring: "ring-info/30", text: "text-foreground", bar: "bg-info" },
] as const;

export function AdminFormSection({
  titulo,
  descricao,
  icone: Icone,
  tone = 0,
  children,
}: {
  titulo: string;
  descricao?: string;
  icone: ComponentType<{ className?: string }>;
  tone?: number;
  children: ReactNode;
}) {
  const t = SECTION_TONES[tone % SECTION_TONES.length]!;
  return (
    <Card className="relative overflow-hidden shadow-card" styles={{ body: { padding: 0 } }}>
      <div className="space-y-5 p-5 sm:p-6">
        <div className={cn("absolute inset-x-0 top-0 h-1.5", t.bar)} aria-hidden />
        <div className="flex items-start gap-3 pt-1">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", t.bg, t.ring)}>
            <Icone className={cn("h-4.5 w-4.5", t.text)} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold sm:text-lg">{titulo}</h2>
            {descricao && <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>}
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </Card>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ListEditor({
  label,
  values,
  onChange,
  placeholder,
  addLabel = "Adicionar item",
  multiline = false,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-start gap-2">
            {multiline ? (
              <TextArea
                value={value}
                onChange={(e) => {
                  const next = [...values];
                  next[index] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                rows={3}
                className="min-h-[4.5rem] resize-y rounded-xl whitespace-pre-wrap break-words"
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => {
                  const next = [...values];
                  next[index] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                className="rounded-xl"
              />
            )}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="shrink-0 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Remover item"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="text-sm font-medium text-primary hover:underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/** Split layout: form left, elevated preview right floating above. */
export function AdminSplitLayout({
  form,
  preview,
}: {
  form: ReactNode;
  preview: ReactNode;
}) {
  return (
    <div className="relative grid gap-0 lg:grid-cols-2">
      <div className="relative z-20 min-w-0 space-y-6 pr-0 lg:pr-8">{form}</div>

      <div className="relative z-10 hidden lg:block">
        <div className="admin-preview-pane pointer-events-auto sticky top-20 h-[calc(100vh-6.5rem)] overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-[-24px_0_48px_-12px_rgba(37,48,44,0.28),0_8px_30px_rgba(37,48,44,0.12),0_28px_70px_-18px_rgba(37,48,44,0.4)] ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-orange-200/40 bg-gradient-to-r from-[#ff774a] to-[#e85d2c] px-5 py-3.5 text-white">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
                Pré-visualização
              </p>
              <p className="text-sm font-medium text-white">Como a página ficará publicada</p>
            </div>
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#c2410c] shadow-sm">
              Ao vivo
            </span>
          </div>
          <div className="stylish-scroll h-[calc(100%-3.5rem)] overflow-y-auto overscroll-contain bg-background p-5">
            {preview}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3 lg:hidden">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#ff774a] to-[#e85d2c] px-4 py-3 text-white">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
              Pré-visualização
            </p>
            <p className="text-sm font-medium">Como a página ficará publicada</p>
          </div>
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#c2410c]">
            Ao vivo
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card p-4 shadow-lift">{preview}</div>
      </div>
    </div>
  );
}
