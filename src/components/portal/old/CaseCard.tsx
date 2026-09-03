import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Pencil, Sparkles, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CaseItem, Impacto, Status } from "@/data/types";
import { integracaoLogoPorNome, logoDaIntegracao } from "@/data/logos";
import { ResponsavelAvatar } from "@/components/portal/old/ResponsavelAvatar";
import { responsavelDoCase } from "@/lib/responsaveis";

/** Integration names shown on case cards (from case tools list). */
function integracoesDoCard(item: CaseItem): string[] {
  return (item.ferramentas ?? []).slice(0, 3);
}

export function StatusBadge({ status }: { status: Status }) {
  const cor =
    status === "Em produção"
      ? "bg-forest/12 text-accent border-accent/25"
      : status === "Piloto"
        ? "bg-primary/12 text-brand-deep border-primary/30"
        : status === "Em desenvolvimento"
          ? "bg-secondary text-muted-foreground border-border"
          : "bg-lime/40 text-ink border-lime";
  return (
    <Badge variant="outline" className={`rounded-full font-normal ${cor}`}>
      {status}
    </Badge>
  );
}

export function ImpactoBadge({ impacto }: { impacto: Impacto }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          impacto === "Alto" ? "bg-primary" : impacto === "Médio" ? "bg-accent" : "bg-border"
        }`}
      />
      Impacto {impacto.toLowerCase()}
    </span>
  );
}

/** Colored header — avatar straddles green/white like the classic print. */
export function CaseThumb({ item, alto }: { item: CaseItem; alto?: boolean }) {
  const responsavel = responsavelDoCase(item);
  return (
    <div
      className={`relative ${alto ? "h-[136px]" : "h-[7.25rem]"}`}
      style={{ backgroundColor: item.cor }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,.55) 0, transparent 45%), radial-gradient(circle at 85% 70%, rgba(255,255,255,.3) 0, transparent 40%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 flex items-start justify-start p-3.5">
        <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink shadow-sm">
          {item.area}
        </span>
      </div>
      {responsavel ? (
        <div className="absolute bottom-0 left-3.5 right-3.5 z-10 flex translate-y-1/2 items-end gap-2.5">
          <ResponsavelAvatar
            nome={responsavel.nome}
            avatarUrl={responsavel.avatarUrl}
            className="h-12 w-12 shrink-0 border-2 border-white bg-white text-xs shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
          />
          <span className="mb-7 min-w-0 truncate text-xs font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            {responsavel.nome}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function CaseCard({
  item,
  de,
  onDelete,
  onEdit,
}: {
  item: CaseItem;
  de?: string;
  onDelete?: (id: string) => void;
  onEdit?: (item: CaseItem) => void;
}) {
  const responsavel = responsavelDoCase(item);
  const homeShadow =
    de === "home"
      ? "shadow-[0_4px_12px_-3px_rgba(37,48,44,0.14),0_16px_40px_-10px_rgba(37,48,44,0.22)] hover:shadow-[0_8px_20px_-4px_rgba(37,48,44,0.16),0_28px_56px_-12px_rgba(37,48,44,0.28)]"
      : "shadow-[0_4px_12px_-3px_rgba(37,48,44,0.12),0_14px_36px_-10px_rgba(37,48,44,0.2)] hover:shadow-[0_8px_20px_-4px_rgba(37,48,44,0.16),0_28px_56px_-12px_rgba(37,48,44,0.28)]";

  return (
    <Card
      className={`case-card-lift group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-foreground/12 bg-card p-0 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-3 ${homeShadow}`}
    >
      {/* Card inteiro clicável */}
      <Link
        to="/cases/$id"
        params={{ id: item.id }}
        search={{ de: de ?? "cases" }}
        aria-label={`Abrir case ${item.nome}`}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      {(onEdit || onDelete) && (
        <div className="absolute right-3 top-3 z-20 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(item);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-card/95 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label={`Editar ${item.nome}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-card/95 text-muted-foreground shadow-sm transition-colors hover:text-destructive"
              aria-label={`Excluir ${item.nome}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      )}
      <div className="relative z-[1]">
        <CaseThumb item={item} />
      </div>

      <div
        className={`relative z-0 flex min-w-0 flex-1 flex-col bg-card px-5 pb-5 ${
          responsavel ? "pt-9" : "pt-5"
        }`}
      >
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
        </div>
        <h3 className="text-pretty text-base font-semibold leading-snug tracking-tight sm:text-[17px]">
          {item.nome}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {item.descricao}
        </p>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
          Integrações
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          {integracoesDoCard(item).map((f) => {
            const logo = logoDaIntegracao(f) ?? integracaoLogoPorNome(f);
            return logo ? (
              <img
                key={f}
                src={logo}
                alt={f}
                title={f}
                className="h-5 w-5 object-contain opacity-90"
              />
            ) : (
              <span
                key={f}
                className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground/80"
              >
                {f}
              </span>
            );
          })}
        </div>

        <div className="mt-5 flex-1" />

        <span className="flex h-11 w-full items-center justify-between rounded-full bg-secondary px-4 text-sm font-medium text-foreground/85 transition-colors group-hover:bg-secondary/80">
          Ver case
          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Card>
  );
}

export function MetricCard({
  valor,
  label,
  detalhe,
  icone,
}: {
  valor: string;
  label: string;
  detalhe?: string;
  icone?: "clock" | "spark" | "users";
}) {
  const Icon = icone === "clock" ? Clock : icone === "users" ? Users : Sparkles;
  return (
    <Card className="flex flex-col p-5 shadow-card">
      <Icon className="mb-3 h-4 w-4 text-primary" />
      <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{valor}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {detalhe?.trim() ? (
        <p className="mt-3 border-t border-border/70 pt-3 text-sm leading-relaxed text-foreground/80">
          {detalhe}
        </p>
      ) : null}
    </Card>
  );
}
